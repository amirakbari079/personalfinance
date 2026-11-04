package com.personalfinance.intelligence.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalfinance.intelligence.HistoryRange;
import com.personalfinance.intelligence.ProviderCodes;
import com.personalfinance.intelligence.entity.MacroIndicator;
import com.personalfinance.intelligence.entity.MacroObservation;
import com.personalfinance.intelligence.macro.BlsCpiParser;
import com.personalfinance.intelligence.macro.CpiYoyCalculator;
import com.personalfinance.intelligence.macro.ImfWeoParser;
import com.personalfinance.intelligence.macro.WorldBankMacroParser;
import com.personalfinance.intelligence.repository.MacroIndicatorRepository;
import com.personalfinance.intelligence.repository.MacroObservationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class MacroIngestService {

    private static final Logger log = LoggerFactory.getLogger(MacroIngestService.class);

    private final MacroIndicatorRepository indicatorRepository;
    private final MacroObservationRepository observationRepository;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public MacroIngestService(
            MacroIndicatorRepository indicatorRepository,
            MacroObservationRepository observationRepository,
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper) {
        this.indicatorRepository = indicatorRepository;
        this.observationRepository = observationRepository;
        this.restClient = restClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public int refreshIfStale() {
        if (!needsRefresh()) {
            return 0;
        }
        return refreshAll();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public int refreshAll() {
        int stored = 0;
        Instant now = Instant.now();
        for (MacroIndicator indicator : indicatorRepository.findAllByActiveTrueOrderByCodeAsc()) {
            try {
                stored += switch (indicator.getSourceCode()) {
                    case "BLS" -> ingestBls(indicator, now);
                    case "IMF" -> ingestImf(indicator, now);
                    case "WORLDBANK" -> ingestWorldBank(indicator, now);
                    default -> 0;
                };
            } catch (Exception e) {
                log.warn("Macro ingest failed for {}: {}", indicator.getCode(), e.getMessage());
            }
        }
        return stored;
    }

    boolean needsRefresh() {
        LocalDate today = LocalDate.now(HistoryRange.TEHRAN);
        YearMonth expectedMonth = YearMonth.from(today).minusMonths(1);
        int currentYear = today.getYear();
        for (MacroIndicator indicator : indicatorRepository.findAllByActiveTrueOrderByCodeAsc()) {
            var latest = observationRepository.findFirstByIndicatorIdOrderByPeriodDesc(indicator.getId());
            if (latest.isEmpty()) {
                return true;
            }
            String period = latest.get().getPeriod();
            if ("MONTHLY".equals(indicator.getFrequency())) {
                YearMonth ym = parseYearMonth(period);
                if (ym == null || ym.isBefore(expectedMonth)) {
                    return true;
                }
            } else if (parseYear(period) < currentYear) {
                return true;
            }
        }
        return false;
    }

    private int ingestBls(MacroIndicator indicator, Instant now) throws Exception {
        String body = restClient.get()
                .uri("https://api.bls.gov/publicAPI/v1/timeseries/data/" + indicator.getSourcePath())
                .retrieve()
                .body(String.class);
        List<CpiYoyCalculator.Observation> rows =
                CpiYoyCalculator.yearOverYear(BlsCpiParser.parse(body, objectMapper));
        return persistChronological(indicator, now, ProviderCodes.BLS, toPairs(rows));
    }

    private int ingestImf(MacroIndicator indicator, Instant now) throws Exception {
        String[] parts = indicator.getSourcePath().split("/", 2);
        if (parts.length != 2) {
            return 0;
        }
        String body = restClient.get()
                .uri("https://www.imf.org/external/datamapper/api/v1/" + parts[0])
                .retrieve()
                .body(String.class);
        int maxYear = LocalDate.now(HistoryRange.TEHRAN).getYear();
        List<ImfWeoParser.Observation> rows = ImfWeoParser.parse(body, parts[1], maxYear, objectMapper);
        return persistChronological(indicator, now, ProviderCodes.IMF, imfPairs(rows));
    }

    private int ingestWorldBank(MacroIndicator indicator, Instant now) throws Exception {
        String[] parts = indicator.getSourcePath().split("/", 2);
        if (parts.length != 2) {
            return 0;
        }
        String body = restClient.get().uri("https://api.worldbank.org/v2/country/" + parts[0]
                + "/indicator/" + parts[1]
                + "?format=json&mrnev=8").retrieve().body(String.class);
        List<WorldBankMacroParser.Observation> rows = WorldBankMacroParser.parse(body, objectMapper);
        List<PeriodValue> chronological = new java.util.ArrayList<>();
        for (int i = rows.size() - 1; i >= 0; i--) {
            chronological.add(new PeriodValue(rows.get(i).period(), rows.get(i).value()));
        }
        return persistChronological(indicator, now, ProviderCodes.WORLDBANK, chronological);
    }

    private int persistChronological(
            MacroIndicator indicator,
            Instant now,
            String source,
            List<PeriodValue> chronological) {
        int stored = 0;
        PeriodValue previous = null;
        for (PeriodValue row : chronological) {
            if (observationRepository.existsByIndicatorIdAndPeriod(indicator.getId(), row.period())) {
                previous = row;
                continue;
            }
            MacroObservation observation = new MacroObservation();
            observation.setIndicatorId(indicator.getId());
            observation.setPeriod(row.period());
            observation.setValue(row.value());
            observation.setPreviousValue(previousValue(indicator.getId(), row.period(), previous));
            observation.setUnit(indicator.getUnit());
            observation.setSource(source);
            observation.setPublishedAt(now);
            observationRepository.save(observation);
            previous = row;
            stored++;
        }
        return stored;
    }

    private BigDecimal previousValue(Long indicatorId, String period, PeriodValue previous) {
        if (previous != null) {
            return previous.value();
        }
        return observationRepository
                .findFirstByIndicatorIdAndPeriodLessThanOrderByPeriodDesc(indicatorId, period)
                .map(MacroObservation::getValue)
                .orElse(null);
    }

    private static List<PeriodValue> toPairs(List<CpiYoyCalculator.Observation> rows) {
        List<PeriodValue> out = new java.util.ArrayList<>(rows.size());
        for (CpiYoyCalculator.Observation row : rows) {
            out.add(new PeriodValue(row.period(), row.value()));
        }
        return out;
    }

    private static List<PeriodValue> imfPairs(List<ImfWeoParser.Observation> rows) {
        List<PeriodValue> out = new java.util.ArrayList<>(rows.size());
        for (ImfWeoParser.Observation row : rows) {
            out.add(new PeriodValue(row.period(), row.value()));
        }
        return out;
    }

    private static YearMonth parseYearMonth(String period) {
        try {
            return YearMonth.parse(period);
        } catch (Exception ignored) {
            return null;
        }
    }

    private static int parseYear(String period) {
        try {
            return Integer.parseInt(period.substring(0, 4));
        } catch (Exception ignored) {
            return 0;
        }
    }

    private record PeriodValue(String period, BigDecimal value) {}
}
