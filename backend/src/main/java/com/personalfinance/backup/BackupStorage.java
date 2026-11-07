package com.personalfinance.backup;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Stream;

@Component
public class BackupStorage {

    static final String FORMAT_MARKER = "personalfinance-backup-v1";
    private static final Pattern SAFE_NAME =
            Pattern.compile("^personalfinance-backup-\\d{8}-\\d{6}(?:-\\d{3}-[a-f0-9]{8})?\\.json$");
    private static final DateTimeFormatter FILE_STAMP =
            DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss-SSS");
    private static final List<String> LEGACY_DIR_NAMES =
            List.of("backups", "backup", "data", "export", "exports", "dumps");

    private final Path backupDir;

    public BackupStorage(@Value("${app.backup.dir:}") String configuredDir) {
        this.backupDir = resolveBackupDir(configuredDir);
    }

    public Path dir() {
        return backupDir;
    }

    public Path resolveExisting(String filename) {
        Path file = resolveSafe(filename);
        if (!Files.isRegularFile(file)) {
            throw new java.util.NoSuchElementException("فایل بکاپ پیدا نشد");
        }
        return file;
    }

    public Path resolveSafe(String filename) {
        if (filename == null || !SAFE_NAME.matcher(filename).matches()) {
            throw new IllegalArgumentException("نام فایل بکاپ نامعتبر است");
        }
        Path file = backupDir.resolve(filename).normalize();
        if (!file.startsWith(backupDir)) {
            throw new IllegalArgumentException("نام فایل بکاپ نامعتبر است");
        }
        return file;
    }

    public String newFilename() {
        return "personalfinance-backup-" + LocalDateTime.now(java.time.ZoneId.of("Asia/Tehran")).format(FILE_STAMP)
                + "-" + java.util.UUID.randomUUID().toString().substring(0,8) + ".json";
    }

    public boolean isSafeName(String filename) {
        return filename != null && SAFE_NAME.matcher(filename).matches();
    }

    public void ensureDir() throws IOException {
        Files.createDirectories(backupDir);
    }

    public List<Path> listBackupFiles() throws IOException {
        ensureDir();
        if (!Files.isDirectory(backupDir)) {
            return List.of();
        }
        try (Stream<Path> stream = Files.list(backupDir)) {
            return stream
                    .filter(Files::isRegularFile)
                    .filter(p -> isSafeName(p.getFileName().toString()))
                    .sorted((a, b) -> b.getFileName().toString().compareTo(a.getFileName().toString()))
                    .toList();
        }
    }

    /**
     * Copies loose backup JSON files from common project folders into backups/.
     * Returns filenames that were newly copied.
     */
    public List<String> collectLooseBackups() throws IOException {
        ensureDir();
        Path root = backupDir.getParent();
        if (root == null) {
            return List.of();
        }
        List<Path> candidates = new ArrayList<>();
        try (Stream<Path> top = Files.list(root)) {
            top.filter(Files::isRegularFile)
                    .filter(p -> p.getFileName().toString().endsWith(".json"))
                    .forEach(candidates::add);
        }
        for (String name : LEGACY_DIR_NAMES) {
            Path folder = root.resolve(name);
            if (!Files.isDirectory(folder)) {
                continue;
            }
            try (Stream<Path> files = Files.walk(folder, 2)) {
                files.filter(Files::isRegularFile)
                        .filter(p -> p.getFileName().toString().endsWith(".json"))
                        .forEach(candidates::add);
            }
        }

        List<String> imported = new ArrayList<>();
        for (Path source : candidates) {
            Path normalized = source.toAbsolutePath().normalize();
            if (normalized.startsWith(backupDir) && isSafeName(normalized.getFileName().toString())) {
                continue;
            }
            if (!looksLikeBackup(normalized)) {
                continue;
            }
            String targetName = isSafeName(source.getFileName().toString())
                    ? source.getFileName().toString()
                    : newFilename();
            Path target = backupDir.resolve(targetName);
            if (Files.exists(target)) {
                continue;
            }
            Files.copy(source, target);
            imported.add(targetName);
        }
        return imported;
    }

    private boolean looksLikeBackup(Path file) {
        try (java.io.InputStream in = Files.newInputStream(file)) {
            byte[] buf = new byte[400];
            int n = in.read(buf);
            return n > 0 && new String(buf, 0, n, java.nio.charset.StandardCharsets.UTF_8)
                    .contains(FORMAT_MARKER);
        } catch (Exception e) {
            return false;
        }
    }

    private static Path resolveBackupDir(String configuredDir) {
        if (configuredDir != null && !configuredDir.isBlank()) {
            return Path.of(configuredDir).toAbsolutePath().normalize();
        }
        return resolveProjectRoot().resolve("backups");
    }

    static Path resolveProjectRoot() {
        Path dir = Path.of(System.getProperty("user.dir")).toAbsolutePath().normalize();
        for (int i = 0; i < 6 && dir != null; i++) {
            if (Files.isDirectory(dir.resolve("backend")) && Files.isDirectory(dir.resolve("frontend"))) {
                return dir;
            }
            Path parent = dir.getParent();
            if (parent != null
                    && "backend".equalsIgnoreCase(String.valueOf(dir.getFileName()))
                    && Files.isDirectory(parent.resolve("frontend"))) {
                return parent;
            }
            dir = parent;
        }
        Path fallback = Path.of(System.getProperty("user.dir")).toAbsolutePath().normalize();
        if ("backend".equalsIgnoreCase(String.valueOf(fallback.getFileName())) && fallback.getParent() != null) {
            return fallback.getParent();
        }
        return fallback;
    }
}
