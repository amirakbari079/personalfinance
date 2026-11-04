package com.personalfinance.advisor.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalfinance.advisor.AdvisorCacheKey;
import com.personalfinance.advisor.AdvisorPortfolioFingerprint;
import com.personalfinance.advisor.AdvisorRequestNormalizer;
import com.personalfinance.advisor.AdvisorSymbols;
import com.personalfinance.advisor.RecommendationLifecycle;
import com.personalfinance.advisor.dto.AdvisorContextResponse;
import com.personalfinance.advisor.dto.AdvisorDraftRequest;
import com.personalfinance.advisor.dto.AdvisorRecommendationResponse;
import com.personalfinance.advisor.entity.AdvisorPromptVersion;
import com.personalfinance.advisor.entity.AdvisorRecommendation;
import com.personalfinance.advisor.entity.AdvisorSession;
import com.personalfinance.advisor.entity.InvestmentThesis;
import com.personalfinance.advisor.entity.RecommendationStatus;
import com.personalfinance.advisor.entity.ThesisStatus;
import com.personalfinance.advisor.llm.AdvisorLlmClient;
import com.personalfinance.advisor.llm.AdvisorLlmResult;
import com.personalfinance.advisor.repository.AdvisorPromptVersionRepository;
import com.personalfinance.advisor.repository.AdvisorRecommendationRepository;
import com.personalfinance.advisor.repository.AdvisorSessionRepository;
import com.personalfinance.advisor.repository.InvestmentThesisRepository;
import com.personalfinance.intelligence.repository.MarketSnapshotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.EnumSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;

@Service
public class AdvisorRecommendationService {

    private static final Set<RecommendationStatus> REUSABLE =
            EnumSet.of(RecommendationStatus.ACTIVE, RecommendationStatus.DRAFT);
    private static final Set<RecommendationStatus> OPEN =
            EnumSet.of(RecommendationStatus.ACTIVE, RecommendationStatus.DRAFT);

    private final AdvisorContextBuilder advisorContextBuilder;
    private final AdvisorLlmClient advisorLlmClient;
    private final AdvisorPromptVersionRepository promptVersionRepository;
    private final AdvisorSessionRepository sessionRepository;
    private final AdvisorRecommendationRepository recommendationRepository;
    private final InvestmentThesisRepository thesisRepository;
    private final MarketSnapshotRepository marketSnapshotRepository;
    private final ObjectMapper objectMapper;
    private final TransactionTemplate transactionTemplate;

    public AdvisorRecommendationService(
            AdvisorContextBuilder advisorContextBuilder,
            AdvisorLlmClient advisorLlmClient,
            AdvisorPromptVersionRepository promptVersionRepository,
            AdvisorSessionRepository sessionRepository,
            AdvisorRecommendationRepository recommendationRepository,
            InvestmentThesisRepository thesisRepository,
            MarketSnapshotRepository marketSnapshotRepository,
            ObjectMapper objectMapper,
            PlatformTransactionManager transactionManager) {
        this.advisorContextBuilder = advisorContextBuilder;
        this.advisorLlmClient = advisorLlmClient;
        this.promptVersionRepository = promptVersionRepository;
        this.sessionRepository = sessionRepository;
        this.recommendationRepository = recommendationRepository;
        this.thesisRepository = thesisRepository;
        this.marketSnapshotRepository = marketSnapshotRepository;
        this.objectMapper = objectMapper;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    public AdvisorRecommendationResponse analyze(AdvisorDraftRequest request) {
        Prepared prepared = transactionTemplate.execute(status -> prepare(request));
        if (prepared == null) {
            throw new IllegalStateException("آماده‌سازی تحلیل مشاور ناموفق بود");
        }
        if (prepared.cached() != null) {
            AdvisorRecommendationResponse reused = transactionTemplate.execute(status -> reuse(prepared.cached()));
            if (reused == null) {
                throw new IllegalStateException("بازاستفاده از تحلیل قبلی ناموفق بود");
            }
            return reused;
        }
        AdvisorLlmResult llm = advisorLlmClient.complete(
                prepared.context(), prepared.question(), prepared.prompt().getSystemPrompt());
        AdvisorRecommendationResponse saved = transactionTemplate.execute(status -> persist(prepared, llm));
        if (saved == null) {
            throw new IllegalStateException("ثبت تحلیل مشاور ناموفق بود");
        }
        return saved;
    }

    private Prepared prepare(AdvisorDraftRequest request) {
        List<String> symbols = AdvisorSymbols.parse(request.getSymbols());
        String selectedAssets = String.join(",", symbols);
        String risk = AdvisorRequestNormalizer.risk(request.getRiskTolerance());
        String horizon = AdvisorRequestNormalizer.horizon(request.getTimeHorizon());
        String liquidity = AdvisorRequestNormalizer.liquidity(request.getLiquidityRequirement());
        String question = request.getQuestion().trim();

        AdvisorPromptVersion prompt = promptVersionRepository.findFirstByActiveTrueOrderByIdDesc()
                .orElseThrow(() -> new IllegalStateException("نسخه پرامپت مشاور یافت نشد"));
        AdvisorContextResponse context = advisorContextBuilder.build(request);
        Long snapshotId = context.getMarketSnapshotId();
        Long capital = request.getCapitalAmount();
        if (capital == null && context.getPortfolio() != null && context.getPortfolio().getTotalToman() > 0) {
            capital = context.getPortfolio().getTotalToman();
        }
        String portfolioFingerprint = AdvisorPortfolioFingerprint.of(context.getPortfolio());

        String decisionKey = AdvisorCacheKey.decisionKey(
                selectedAssets, horizon, risk, capital, question, portfolioFingerprint);
        String cacheKey = AdvisorCacheKey.cacheKey(decisionKey, snapshotId, prompt.getCode());

        AdvisorRecommendation cached = recommendationRepository
                .findFirstByCacheKeyAndStatusInOrderByCreatedAtDesc(cacheKey, REUSABLE)
                .orElse(null);
        return new Prepared(
                request,
                symbols,
                selectedAssets,
                risk,
                horizon,
                liquidity,
                question,
                prompt,
                context,
                snapshotId,
                capital,
                decisionKey,
                cacheKey,
                cached);
    }

    private AdvisorRecommendationResponse reuse(AdvisorRecommendation cached) {
        cached.setReuseCount(cached.getReuseCount() + 1);
        recommendationRepository.save(cached);
        return toResponse(cached, true);
    }

    private AdvisorRecommendationResponse persist(Prepared prepared, AdvisorLlmResult llm) {
        AdvisorSession session = new AdvisorSession();
        session.setQuestion(prepared.question());
        session.setObjective(blankToNull(prepared.request().getObjective()));
        session.setSelectedAssets(prepared.selectedAssets());
        session.setCapitalAmount(prepared.capital());
        session.setCurrency("IRT");
        session.setTimeHorizon(prepared.horizon());
        session.setRiskTolerance(prepared.risk());
        session.setLiquidityRequirement(prepared.liquidity());
        session.setConstraintsText(blankToNull(prepared.request().getConstraints()));
        session.setPortfolioJson(portfolioJson(prepared.context()));
        session = sessionRepository.save(session);

        AdvisorRecommendation rec = new AdvisorRecommendation();
        rec.setSessionId(session.getId());
        rec.setMarketSnapshotId(prepared.snapshotId());
        rec.setPromptVersionId(prepared.prompt().getId());
        rec.setCacheKey(prepared.cacheKey());
        rec.setDecisionKey(prepared.decisionKey());
        rec.setModel(llm.model());
        rec.setProvider(llm.provider());
        rec.setFake(llm.fake());
        rec.setStatus(RecommendationStatus.ACTIVE);
        rec.setBody(llm.text());
        rec.setReasoningSummary(AdvisorCacheKey.summarize(llm.text()));
        rec = recommendationRepository.save(rec);

        InvestmentThesis thesis = new InvestmentThesis();
        thesis.setRecommendationId(rec.getId());
        thesis.setTitle(AdvisorCacheKey.titleFromQuestion(prepared.question()));
        thesis.setAssetSymbol(prepared.symbols().getFirst());
        thesis.setAssumptions(assumptions(
                prepared.horizon(),
                prepared.risk(),
                prepared.capital(),
                prepared.request().getConstraints(),
                prepared.context()));
        thesis.setInvalidationConditions(
                "اگر اسنپ‌شات بازار عوض شود یا فرض‌های افق/ریسک/نقدشوندگی نقض شوند، این تز بازبینی شود.");
        thesis.setStatus(ThesisStatus.ACTIVE);
        thesisRepository.save(thesis);

        supersedeOpen(prepared.decisionKey(), rec.getId());
        return toResponse(rec, false);
    }

    private record Prepared(
            AdvisorDraftRequest request,
            List<String> symbols,
            String selectedAssets,
            String risk,
            String horizon,
            String liquidity,
            String question,
            AdvisorPromptVersion prompt,
            AdvisorContextResponse context,
            Long snapshotId,
            Long capital,
            String decisionKey,
            String cacheKey,
            AdvisorRecommendation cached) {
    }

    @Transactional(readOnly = true)
    public List<AdvisorRecommendationResponse> list() {
        return recommendationRepository.findTop50ByOrderByCreatedAtDesc().stream()
                .map(rec -> toResponse(rec, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public AdvisorRecommendationResponse get(Long id) {
        AdvisorRecommendation rec = recommendationRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("توصیه یافت نشد"));
        return toResponse(rec, false);
    }

    @Transactional
    public AdvisorRecommendationResponse transition(Long id, RecommendationStatus target, String reason) {
        if (target == RecommendationStatus.SUPERSEDED) {
            throw new IllegalArgumentException("جایگزینی فقط با تحلیل جدید انجام می‌شود");
        }
        AdvisorRecommendation rec = recommendationRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("توصیه یافت نشد"));
        RecommendationLifecycle.requireTransition(rec.getStatus(), target);
        rec.setStatus(target);
        rec.setStatusReason(blankToNull(reason));
        recommendationRepository.save(rec);
        syncThesis(rec);
        return toResponse(rec, false);
    }

    private void supersedeOpen(String decisionKey, Long keepId) {
        for (AdvisorRecommendation existing : recommendationRepository.findByDecisionKeyAndStatusIn(decisionKey, OPEN)) {
            if (existing.getId().equals(keepId)) {
                continue;
            }
            existing.setStatus(RecommendationStatus.SUPERSEDED);
            existing.setStatusReason("تحلیل جدید با اسنپ‌شات یا پرامپت متفاوت جایگزین شد");
            recommendationRepository.save(existing);
            syncThesis(existing);
        }
    }

    private void syncThesis(AdvisorRecommendation rec) {
        thesisRepository.findByRecommendationId(rec.getId()).ifPresent(thesis -> {
            ThesisStatus next = RecommendationLifecycle.followThesis(rec.getStatus());
            if (thesis.getStatus() != next) {
                thesis.setStatus(next);
                thesisRepository.save(thesis);
            }
        });
    }

    private AdvisorRecommendationResponse toResponse(AdvisorRecommendation rec, boolean cached) {
        AdvisorSession session = sessionRepository.findById(rec.getSessionId()).orElse(null);
        InvestmentThesis thesis = thesisRepository.findByRecommendationId(rec.getId()).orElse(null);
        String promptCode = promptVersionRepository.findById(rec.getPromptVersionId())
                .map(AdvisorPromptVersion::getCode)
                .orElse(null);
        Long latestSnapshotId = marketSnapshotRepository.findFirstByOrderByCapturedAtDesc()
                .map(snapshot -> snapshot.getId())
                .orElse(null);
        return AdvisorRecommendationResponse.from(rec, session, thesis, promptCode, latestSnapshotId, cached);
    }

    private static String assumptions(
            String horizon,
            String risk,
            Long capital,
            String constraints,
            AdvisorContextResponse context) {
        StringBuilder text = new StringBuilder();
        text.append("ریسک: ").append(risk);
        if (horizon != null) {
            text.append("؛ افق: ").append(horizon);
        }
        if (capital != null) {
            text.append("؛ سرمایه: ").append(capital).append(" تومان");
        }
        if (context.getPortfolio() != null) {
            text.append("؛ پرتفوی: ").append(context.getPortfolio().getTotalToman()).append(" تومان");
        }
        if (context.getFreshness() != null && context.getFreshness().isMarketStale()) {
            text.append("؛ هشدار تازگی داده");
        }
        if (constraints != null && !constraints.isBlank()) {
            text.append("؛ محدودیت: ").append(constraints.trim());
        }
        return text.toString();
    }

    private String portfolioJson(AdvisorContextResponse context) {
        try {
            return objectMapper.writeValueAsString(context.getPortfolio());
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("ثبت پرتفوی مشاور ناموفق بود");
        }
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
