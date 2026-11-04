package com.personalfinance.intelligence.service;

import com.personalfinance.intelligence.dto.MacroIndicatorResponse;
import com.personalfinance.intelligence.dto.MacroObservationPoint;
import com.personalfinance.intelligence.entity.MacroIndicator;
import com.personalfinance.intelligence.entity.MacroObservation;
import com.personalfinance.intelligence.repository.MacroIndicatorRepository;
import com.personalfinance.intelligence.repository.MacroObservationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class MacroQueryService {

    private static final Logger log = LoggerFactory.getLogger(MacroQueryService.class);

    private final MacroIndicatorRepository indicatorRepository;
    private final MacroObservationRepository observationRepository;
    private final MacroIngestService macroIngestService;

    public MacroQueryService(
            MacroIndicatorRepository indicatorRepository,
            MacroObservationRepository observationRepository,
            MacroIngestService macroIngestService) {
        this.indicatorRepository = indicatorRepository;
        this.observationRepository = observationRepository;
        this.macroIngestService = macroIngestService;
    }

    @Transactional(readOnly = true)
    public List<MacroIndicatorResponse> latest() {
        return latest(true);
    }

    @Transactional(readOnly = true)
    public List<MacroIndicatorResponse> latest(boolean includeHistory) {
        try {
            macroIngestService.refreshIfStale();
        } catch (Exception e) {
            log.warn("Macro refresh-on-read failed: {}", e.getMessage());
        }
        List<MacroIndicatorResponse> result = new ArrayList<>();
        for (MacroIndicator indicator : indicatorRepository.findAllByActiveTrueOrderByCodeAsc()) {
            result.add(toResponse(indicator, includeHistory));
        }
        return result;
    }

    private MacroIndicatorResponse toResponse(MacroIndicator indicator, boolean includeHistory) {
        MacroIndicatorResponse row = new MacroIndicatorResponse();
        row.setId(indicator.getId());
        row.setCode(indicator.getCode());
        row.setName(indicator.getName());
        row.setCountry(indicator.getCountry());
        row.setUnit(indicator.getUnit());
        row.setFrequency(indicator.getFrequency());
        row.setSourceCode(indicator.getSourceCode());

        if (includeHistory) {
            List<MacroObservation> recent =
                    observationRepository.findTop8ByIndicatorIdOrderByPeriodDesc(indicator.getId());
            if (!recent.isEmpty()) {
                applyLatest(row, recent.getFirst());
            }
            for (int i = recent.size() - 1; i >= 0; i--) {
                MacroObservation observation = recent.get(i);
                MacroObservationPoint point = new MacroObservationPoint();
                point.setPeriod(observation.getPeriod());
                point.setValue(observation.getValue());
                row.getHistory().add(point);
            }
        } else {
            observationRepository.findFirstByIndicatorIdOrderByPeriodDesc(indicator.getId())
                    .ifPresent(latest -> applyLatest(row, latest));
        }
        return row;
    }

    private static void applyLatest(MacroIndicatorResponse row, MacroObservation latest) {
        row.setPeriod(latest.getPeriod());
        row.setValue(latest.getValue());
        row.setPreviousValue(latest.getPreviousValue());
        row.setSource(latest.getSource());
        row.setPublishedAt(latest.getPublishedAt());
    }
}
