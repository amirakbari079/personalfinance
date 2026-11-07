package com.personalfinance.backup;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.personalfinance.backup.dto.BackupDocument;
import com.personalfinance.backup.dto.BackupFileResponse;
import com.personalfinance.backup.dto.RestoreResultResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.sql.DataSource;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class BackupService {

    private static final Logger log = LoggerFactory.getLogger(BackupService.class);
    private static final Set<String> SKIP_TABLES = Set.of("flyway_schema_history", "pf_restore_events");
    private static final Object LOCK = new Object();

    private final DataSource dataSource;
    private final BackupStorage storage;
    private final ObjectMapper mapper;

    public BackupService(DataSource dataSource, BackupStorage storage, ObjectMapper objectMapper) {
        this.dataSource = dataSource;
        this.storage = storage;
        this.mapper = objectMapper.copy()
                .enable(SerializationFeature.INDENT_OUTPUT)
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
    }

    public List<BackupFileResponse> list() {
        synchronized (LOCK) {
            try {
                storage.collectLooseBackups();
                List<BackupFileResponse> result = new ArrayList<>();
                for (Path file : storage.listBackupFiles()) {
                    try {
                        result.add(toResponse(file));
                    } catch (IOException ignored) {
                        // skip unreadable backup files
                    }
                }
                return result;
            } catch (IOException e) {
                throw new IllegalStateException("خطا در خواندن پوشه بکاپ");
            }
        }
    }

    public BackupFileResponse create() {
        synchronized (LOCK) {
            try {
                storage.ensureDir();
                return writeBackup(dumpDatabase());
            } catch (IOException | SQLException e) {
                log.error("Backup create failed", e);
                throw new IllegalStateException("خطا در ساخت بکاپ");
            }
        }
    }

    public BackupFileResponse upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("فایل بکاپ انتخاب نشده است");
        }
        synchronized (LOCK) {
            try {
                storage.ensureDir();
                BackupDocument doc;
                try (InputStream in = file.getInputStream()) {
                    doc = mapper.readValue(in, BackupDocument.class);
                }
                assertValid(doc);
                String filename = storage.isSafeName(file.getOriginalFilename())
                        ? file.getOriginalFilename()
                        : storage.newFilename();
                Path target = storage.resolveSafe(filename);
                if (Files.exists(target)) {
                    filename = storage.newFilename();
                    target = storage.resolveSafe(filename);
                }
                try (var output = Files.newOutputStream(target, java.nio.file.StandardOpenOption.CREATE_NEW)) {
                    mapper.writeValue(output, doc);
                }
                return toResponse(target);
            } catch (IOException e) {
                throw new IllegalArgumentException("فایل بکاپ معتبر نیست");
            }
        }
    }

    public RestoreResultResponse restore(String filename) {
        synchronized (LOCK) {
            Path file = storage.resolveExisting(filename);
            try {
                BackupDocument doc = mapper.readValue(file.toFile(), BackupDocument.class);
                assertValid(doc);
                restoreDocument(doc, filename);
                return RestoreResultResponse.of(filename, doc.countsOrEmpty());
            } catch (IOException | SQLException e) {
                // PostgreSQL exception details may contain an entire financial row.
                log.error("Backup restore failed: {} / SQL state {}", e.getClass().getSimpleName(),
                        e instanceof SQLException sql ? sql.getSQLState() : "n/a");
                throw new IllegalStateException("بازیابی بکاپ ناموفق بود");
            }
        }
    }

    public void delete(String filename) {
        synchronized (LOCK) {
            Path file = storage.resolveExisting(filename);
            try {
                Files.delete(file);
            } catch (IOException e) {
                throw new IllegalStateException("حذف فایل بکاپ ناموفق بود");
            }
        }
    }

    public Path fileForDownload(String filename) {
        return storage.resolveExisting(filename);
    }

    public Path backupDir() {
        return storage.dir();
    }

    private BackupFileResponse toResponse(Path file) throws IOException {
        BackupDocument doc = mapper.readValue(file.toFile(), BackupDocument.class);
        Instant created = doc.getCreatedAt() != null
                ? doc.getCreatedAt()
                : Files.getLastModifiedTime(file).toInstant();
        return BackupFileResponse.of(
                file.getFileName().toString(),
                created,
                Files.size(file),
                doc.countsOrEmpty());
    }

    private void assertValid(BackupDocument doc) {
        if (doc == null || !BackupDocument.FORMAT_V1.equals(doc.getFormat())) {
            throw new IllegalArgumentException("فرمت فایل بکاپ پشتیبانی نمی‌شود");
        }
        if (doc.tablesOrEmpty().isEmpty()) {
            throw new IllegalArgumentException("فایل بکاپ خالی است");
        }
    }

    private BackupDocument dumpDatabase() throws SQLException {
        try (Connection conn = dataSource.getConnection()) {
            conn.setTransactionIsolation(Connection.TRANSACTION_REPEATABLE_READ);
            conn.setReadOnly(true);
            conn.setAutoCommit(false);
            try {
                var document = dumpDatabase(conn);
                conn.commit();
                return document;
            } catch (Exception e) {
                conn.rollback();
                throw e;
            }
        }
    }

    private BackupDocument dumpDatabase(Connection conn) throws SQLException {
        Instant now = Instant.now();
        Map<String, List<Map<String, Object>>> tables = new LinkedHashMap<>();
        Map<String, Integer> counts = new LinkedHashMap<>();
        for (String table : listDataTables(conn)) {
            List<Map<String, Object>> rows = dumpTable(conn, table);
            tables.put(table, rows);
            counts.put(table, rows.size());
        }
        return BackupDocument.of(now, counts, tables);
    }

    private BackupFileResponse writeBackup(BackupDocument doc) throws IOException {
        storage.ensureDir();
        Path file = storage.resolveSafe(storage.newFilename());
        try (var output = Files.newOutputStream(file, java.nio.file.StandardOpenOption.CREATE_NEW)) {
            mapper.writeValue(output, doc);
        }
        return toResponse(file);
    }

    private void restoreDocument(BackupDocument doc, String filename) throws SQLException, IOException {
        try (Connection conn = dataSource.getConnection()) {
            boolean previous = conn.getAutoCommit();
            conn.setAutoCommit(false);
            try {
                List<String> tables = listDataTables(conn);
                validateRestoreSchema(conn, tables, doc);
                // Lock before the safety snapshot, using the SAME connection to avoid races/deadlocks.
                try (Statement st = conn.createStatement()) {
                    st.execute("SET LOCAL lock_timeout='15s'");
                    st.execute("LOCK TABLE " + joinQuoted(tables) + " IN ACCESS EXCLUSIVE MODE");
                }
                String safetyBackup = writeBackup(dumpDatabase(conn)).getFilename();
                try (Statement st = conn.createStatement()) {
                    st.execute("SET CONSTRAINTS ALL DEFERRED");
                    st.execute("SET LOCAL pf.restoring='true'");
                }
                truncate(conn, tables);
                for (String table : tables) {
                    List<Map<String, Object>> rows = doc.tablesOrEmpty().get(table);
                    if (rows == null || rows.isEmpty()) {
                        continue;
                    }
                    insertRows(conn, table, rows);
                }
                // Validate every FK before changing sequences (setval is not transactional).
                try (Statement st = conn.createStatement()) { st.execute("SET CONSTRAINTS ALL IMMEDIATE"); }
                var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                try (PreparedStatement ps = conn.prepareStatement("INSERT INTO pf_restore_events(actor,backup_filename,backup_created_at,safety_backup_filename) VALUES(?,?,?,?)")) {
                    ps.setString(1,auth == null ? "system" : auth.getName());
                    ps.setString(2,filename);
                    ps.setTimestamp(3,doc.getCreatedAt() == null ? null : Timestamp.from(doc.getCreatedAt()));
                    ps.setString(4,safetyBackup);
                    ps.executeUpdate();
                }
                resetSequences(conn, tables);
                conn.commit();
            } catch (Exception e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(previous);
            }
        }
    }

    private void validateRestoreSchema(Connection conn,List<String> tables,BackupDocument doc) throws SQLException {
        if (!new java.util.HashSet<>(tables).equals(doc.tablesOrEmpty().keySet())) {
            throw new IllegalArgumentException("ساختار این بکاپ با نسخهٔ فعلی سازگار نیست؛ اطلاعات فعلی تغییر نکرد. بکاپ قدیمی باید ابتدا جداگانه ارتقا یابد.");
        }
        for (String table : tables) {
            var rows = doc.tablesOrEmpty().get(table);
            if (rows == null || !java.util.Objects.equals(doc.countsOrEmpty().get(table), rows.size()))
                throw new IllegalArgumentException("بکاپ ناقص است؛ تعداد رکوردها تطابق ندارد");
            var columns = new java.util.HashSet<>(columnNames(conn,table));
            for (var row : rows) {
                if (row == null || !columns.equals(row.keySet()))
                    throw new IllegalArgumentException("ستون‌های بکاپ با ساختار فعلی سازگار نیست");
            }
        }
    }

    private List<Map<String, Object>> dumpTable(Connection conn, String table) throws SQLException {
        List<String> columns = columnNames(conn, table);
        String sql = "SELECT " + joinQuoted(columns) + " FROM " + quote(table) + " ORDER BY 1";
        List<Map<String, Object>> rows = new ArrayList<>();
        try (Statement st = conn.createStatement(); ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) {
                Map<String, Object> row = new LinkedHashMap<>();
                for (String column : columns) {
                    row.put(column, toJsonValue(rs.getObject(column)));
                }
                rows.add(row);
            }
        }
        return rows;
    }

    private void insertRows(Connection conn, String table, List<Map<String, Object>> rows)
            throws SQLException {
        Map<String, Integer> types = columnTypes(conn, table);
        List<String> tableColumns = columnNames(conn, table);
        for (Map<String, Object> row : rows) {
            List<String> columns = new ArrayList<>();
            List<Object> values = new ArrayList<>();
            for (String column : tableColumns) {
                if (!row.containsKey(column)) {
                    continue;
                }
                columns.add(column);
                values.add(fromJsonValue(row.get(column), types.getOrDefault(column, Types.VARCHAR)));
            }
            if (columns.isEmpty()) {
                continue;
            }
            String placeholders = String.join(", ", columns.stream().map(c -> "?").toList());
            String sql = "INSERT INTO " + quote(table) + " (" + joinQuoted(columns) + ") VALUES ("
                    + placeholders + ")";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                for (int i = 0; i < values.size(); i++) {
                    Object value = values.get(i);
                    if (value == null) {
                        ps.setNull(i + 1, types.getOrDefault(columns.get(i), Types.NULL));
                    } else if (types.get(columns.get(i)) == Types.OTHER) {
                        // Let PostgreSQL infer the destination JSONB/UUID type, not VARCHAR.
                        ps.setObject(i + 1, value, Types.OTHER);
                    } else {
                        ps.setObject(i + 1, value);
                    }
                }
                ps.executeUpdate();
            }
        }
    }

    private void truncate(Connection conn, List<String> tables) throws SQLException {
        if (tables.isEmpty()) {
            return;
        }
        String sql = "TRUNCATE TABLE " + joinQuoted(tables) + " RESTART IDENTITY";
        try (Statement st = conn.createStatement()) {
            st.execute(sql);
        }
    }

    private void resetSequences(Connection conn, List<String> tables) throws SQLException {
        for (String table : tables) {
            if (!columnNames(conn, table).contains("id")) {
                continue;
            }
            String sequence;
            try (PreparedStatement ps = conn.prepareStatement("SELECT pg_get_serial_sequence(?, 'id')")) {
                ps.setString(1, table);
                try (ResultSet rs = ps.executeQuery()) {
                    if (!rs.next()) {
                        continue;
                    }
                    sequence = rs.getString(1);
                }
            }
            if (sequence == null || sequence.isBlank()) {
                continue;
            }
            String statement = "SELECT setval(?, COALESCE((SELECT MAX(id) FROM " + quote(table) + "), 1), true)";
            try (PreparedStatement ps = conn.prepareStatement(statement)) {
                ps.setString(1, sequence);
                ps.execute();
            }
        }
    }

    private List<String> listDataTables(Connection conn) throws SQLException {
        List<String> tables = new ArrayList<>();
        DatabaseMetaData meta = conn.getMetaData();
        try (ResultSet rs = meta.getTables(null, "public", "%", new String[]{"TABLE"})) {
            while (rs.next()) {
                String name = rs.getString("TABLE_NAME");
                if (name != null && !SKIP_TABLES.contains(name.toLowerCase(Locale.ROOT))) {
                    assertIdent(name);
                    tables.add(name);
                }
            }
        }
        tables.sort(String::compareTo);
        return tables;
    }

    private List<String> columnNames(Connection conn, String table) throws SQLException {
        List<String> columns = new ArrayList<>();
        DatabaseMetaData meta = conn.getMetaData();
        try (ResultSet rs = meta.getColumns(null, "public", table, "%")) {
            while (rs.next()) {
                String name = rs.getString("COLUMN_NAME");
                assertIdent(name);
                columns.add(name);
            }
        }
        return columns;
    }

    private Map<String, Integer> columnTypes(Connection conn, String table) throws SQLException {
        Map<String, Integer> types = new LinkedHashMap<>();
        DatabaseMetaData meta = conn.getMetaData();
        try (ResultSet rs = meta.getColumns(null, "public", table, "%")) {
            while (rs.next()) {
                types.put(rs.getString("COLUMN_NAME"), rs.getInt("DATA_TYPE"));
            }
        }
        return types;
    }

    private Object toJsonValue(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof OffsetDateTime odt) {
            return odt.toInstant().toString();
        }
        if (value instanceof Instant instant) {
            return instant.toString();
        }
        if (value instanceof LocalDate date) {
            return date.toString();
        }
        if (value instanceof LocalDateTime dateTime) {
            return dateTime.toString();
        }
        if (value instanceof Timestamp timestamp) {
            return timestamp.toInstant().toString();
        }
        if (value instanceof Date date) {
            return date.toLocalDate().toString();
        }
        if (value instanceof BigDecimal bd) {
            return bd.toPlainString();
        }
        if (value instanceof Number
                || value instanceof Boolean
                || value instanceof String) {
            return value;
        }
        return String.valueOf(value);
    }

    private Object fromJsonValue(Object raw, int jdbcType) {
        if (raw == null) {
            return null;
        }
        return switch (jdbcType) {
            case Types.BIGINT -> asBigDecimal(raw).longValueExact();
            case Types.INTEGER, Types.SMALLINT -> asBigDecimal(raw).intValueExact();
            case Types.NUMERIC, Types.DECIMAL -> asBigDecimal(raw);
            case Types.BOOLEAN, Types.BIT -> asBoolean(raw);
            case Types.DATE -> LocalDate.parse(raw.toString().substring(0, 10));
            case Types.TIMESTAMP, Types.TIMESTAMP_WITH_TIMEZONE -> parseInstant(raw);
            default -> raw.toString();
        };
    }

    private BigDecimal asBigDecimal(Object raw) {
        if (raw instanceof BigDecimal bd) {
            return bd;
        }
        if (raw instanceof Number number) {
            return new BigDecimal(number.toString());
        }
        return new BigDecimal(raw.toString());
    }

    private Boolean asBoolean(Object raw) {
        if (raw instanceof Boolean b) {
            return b;
        }
        return Boolean.parseBoolean(raw.toString());
    }

    private Timestamp parseInstant(Object raw) {
        String text = raw.toString();
        Instant instant = text.endsWith("Z") || text.contains("+")
                ? Instant.parse(text)
                : LocalDateTime.parse(text).atZone(java.time.ZoneOffset.UTC).toInstant();
        return Timestamp.from(instant);
    }

    private String joinQuoted(List<String> idents) {
        return String.join(", ", idents.stream().map(this::quote).toList());
    }

    private String quote(String ident) {
        assertIdent(ident);
        return "\"" + ident + "\"";
    }

    private void assertIdent(String ident) {
        if (ident == null || !ident.matches("[a-zA-Z_][a-zA-Z0-9_]*")) {
            throw new IllegalStateException("شناسه نامعتبر در پایگاه داده");
        }
    }
}
