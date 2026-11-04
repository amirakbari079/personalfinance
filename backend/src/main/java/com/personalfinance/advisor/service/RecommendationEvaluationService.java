package com.personalfinance.advisor.service;

import com.personalfinance.advisor.RecommendationEvaluator;
import com.personalfinance.advisor.dto.RecommendationEvaluationResponse;
import com.personalfinance.advisor.entity.AdvisorRecommendation;
import com.personalfinance.advisor.entity.AdvisorSession;
import com.personalfinance.advisor.entity.InvestmentThesis;
import com.personalfinance.advisor.entity.RecommendationEvaluation;
import com.personalfinance.advisor.repository.AdvisorRecommendationRepository;
import com.personalfinance.advisor.repository.AdvisorSessionRepository;
import com.personalfinance.advisor.repository.InvestmentThesisRepository;
import com.personalfinance.advisor.repository.RecommendationEvaluationRepository;
import com.personalfinance.common.JalaliDateConverter;
import com.personalfinance.intelligence.HistoryRange;
import com.personalfinance.intelligence.entity.Asset;
import com.personalfinance.intelligence.entity.AssetPriceDaily;
import com.personalfinance.intelligence.repository.AssetPriceDailyRepository;
import com.personalfinance.intelligence.repository.AssetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.NoSuchElementException;

@Service
public class RecommendationEvaluationService {

    private final AdvisorRecommendationRepository recommendationRepository;
    private final AdvisorSessionRepository sessionRepository;
    private final InvestmentThesisRepository thesisRepository;
    private final RecommendationEvaluationRepository evaluationRepository;
    private final AssetRepository assetRepository;
    private final AssetPriceDailyRepository dailyRepository;
    private final JalaliDateConverter jalaliDateConverter;

    public RecommendationEvaluationService(
            AdvisorRecommendationRepository recommendationRepository,
            AdvisorSessionRepository sessionRepository,
            InvestmentThesisRepository thesisRepository,
            RecommendationEvaluationRepository evaluationRepository,
            AssetRepository assetRepository,
            AssetPriceDailyRepository dailyRepository,
            JalaliDateConverter jalaliDateConverter) {
        this.recommendationRepository = recommendationRepository;
        this.sessionRepository = sessionRepository;
        this.thesisRepository = thesisRepository;
        this.evaluationRepository = evaluationRepository;
        this.assetRepository = assetRepository;
        this.dailyRepository = dailyRepository;
        this.jalaliDateConverter = jalaliDateConverter;
    }

    @Transactional
    public RecommendationEvaluationResponse evaluate(Long recommendationId) {
        AdvisorRecommendation rec = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new NoSuchElementException("توصیه یافت نشد"));
        AdvisorSession session = sessionRepository.findById(rec.getSessionId()).orElse(null);
        InvestmentThesis thesis = thesisRepository.findByRecommendationId(rec.getId())
                .orElseThrow(() -> new IllegalStateException("تز این توصیه یافت نشد"));
        if (thesis.getAssetSymbol() == null || thesis.getAssetSymbol().isBlank()) {
            throw new IllegalStateException("نماد دارایی تز مشخص نیست");
        }

        LocalDate adviceDate = rec.getCreatedAt().atZone(HistoryRange.TEHRAN).toLocalDate();
        LocalDate asOf = LocalDate.now(HistoryRange.TEHRAN);
        String horizon = session == null ? null : session.getTimeHorizon();

        Asset asset = assetRepository.findBySymbol(thesis.getAssetSymbol()).orElse(null);
        RecommendationEvaluator.PricePoint assetStart = closeOnOrBefore(asset, adviceDate);
        RecommendationEvaluator.PricePoint assetEnd = latestClose(asset);

        RecommendationEvaluator.Result result = RecommendationEvaluator.evaluate(
                assetStart,
                assetEnd,
                window("GOLD_18K", adviceDate),
                latestWindow("GOLD_18K"),
                window("USD", adviceDate),
                latestWindow("USD"),
                window("BTC", adviceDate),
                latestWindow("BTC"),
                horizon,
                adviceDate,
                asOf);

        RecommendationEvaluation row = evaluationRepository.findByRecommendationId(rec.getId())
                .orElseGet(RecommendationEvaluation::new);
        row.setRecommendationId(rec.getId());
        row.setAssetSymbol(thesis.getAssetSymbol());
        row.setCurrency(asset == null ? "IRT" : asset.getCurrency());
        row.setStartDate(result.startDate());
        row.setEndDate(result.endDate());
        row.setStartPrice(result.startPrice());
        row.setEndPrice(result.endPrice());
        row.setAssetReturnPercent(result.assetReturnPercent());
        row.setGoldReturnPercent(result.goldReturnPercent());
        row.setUsdReturnPercent(result.usdReturnPercent());
        row.setBtcReturnPercent(result.btcReturnPercent());
        row.setAssetMove(result.assetMove());
        row.setTimeHorizon(horizon);
        row.setHorizonEnd(result.horizonEnd());
        row.setHorizonElapsed(result.horizonElapsed());
        row.setStatus(result.status());
        row.setEvaluatedAt(Instant.now());
        evaluationRepository.save(row);

        return RecommendationEvaluationResponse.from(
                row,
                jalaliDateConverter.toJalali(row.getStartDate()),
                jalaliDateConverter.toJalali(row.getEndDate()),
                jalaliDateConverter.toJalali(row.getHorizonEnd()));
    }

    private RecommendationEvaluator.PricePoint window(String symbol, LocalDate onOrBefore) {
        return closeOnOrBefore(assetRepository.findBySymbol(symbol).orElse(null), onOrBefore);
    }

    private RecommendationEvaluator.PricePoint latestWindow(String symbol) {
        return latestClose(assetRepository.findBySymbol(symbol).orElse(null));
    }

    private RecommendationEvaluator.PricePoint closeOnOrBefore(Asset asset, LocalDate onOrBefore) {
        if (asset == null || onOrBefore == null) {
            return null;
        }
        return dailyRepository
                .findFirstByAssetIdAndCurrencyAndTradeDateLessThanEqualOrderByTradeDateDesc(
                        asset.getId(), asset.getCurrency(), onOrBefore)
                .map(RecommendationEvaluationService::toPoint)
                .orElse(null);
    }

    private RecommendationEvaluator.PricePoint latestClose(Asset asset) {
        if (asset == null) {
            return null;
        }
        return dailyRepository
                .findFirstByAssetIdAndCurrencyOrderByTradeDateDesc(asset.getId(), asset.getCurrency())
                .map(RecommendationEvaluationService::toPoint)
                .orElse(null);
    }

    private static RecommendationEvaluator.PricePoint toPoint(AssetPriceDaily row) {
        return new RecommendationEvaluator.PricePoint(row.getTradeDate(), row.getClose());
    }
}
