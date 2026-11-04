package com.personalfinance.advisor.controller;

import com.personalfinance.advisor.dto.AdvisorContextRequest;
import com.personalfinance.advisor.dto.AdvisorContextResponse;
import com.personalfinance.advisor.dto.AdvisorDraftRequest;
import com.personalfinance.advisor.dto.AdvisorRecommendationResponse;
import com.personalfinance.advisor.dto.RecommendationEvaluationResponse;
import com.personalfinance.advisor.dto.RecommendationTransitionRequest;
import com.personalfinance.advisor.service.AdvisorContextBuilder;
import com.personalfinance.advisor.service.AdvisorRecommendationService;
import com.personalfinance.advisor.service.RecommendationEvaluationService;
import com.personalfinance.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/advisor")
public class AdvisorContextController {

    private final AdvisorContextBuilder advisorContextBuilder;
    private final AdvisorRecommendationService advisorRecommendationService;
    private final RecommendationEvaluationService recommendationEvaluationService;

    public AdvisorContextController(
            AdvisorContextBuilder advisorContextBuilder,
            AdvisorRecommendationService advisorRecommendationService,
            RecommendationEvaluationService recommendationEvaluationService) {
        this.advisorContextBuilder = advisorContextBuilder;
        this.advisorRecommendationService = advisorRecommendationService;
        this.recommendationEvaluationService = recommendationEvaluationService;
    }

    @GetMapping("/context")
    public ResponseEntity<ApiResponse<AdvisorContextResponse>> context(
            @RequestParam(required = false) String symbols) {
        return ResponseEntity.ok(ApiResponse.ok(advisorContextBuilder.build(symbols)));
    }

    @PostMapping("/context")
    public ResponseEntity<ApiResponse<AdvisorContextResponse>> preview(
            @Valid @RequestBody AdvisorContextRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(advisorContextBuilder.build(request)));
    }

    @PostMapping("/draft")
    public ResponseEntity<ApiResponse<AdvisorRecommendationResponse>> draft(
            @Valid @RequestBody AdvisorDraftRequest request) {
        AdvisorRecommendationResponse data = advisorRecommendationService.analyze(request);
        if (data.isCached()) {
            return ResponseEntity.ok(ApiResponse.ok("تحلیل قبلی از کش بازاستفاده شد", data));
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("تحلیل ثبت شد", data));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<List<AdvisorRecommendationResponse>>> recommendations() {
        return ResponseEntity.ok(ApiResponse.ok(advisorRecommendationService.list()));
    }

    @GetMapping("/recommendations/{id}")
    public ResponseEntity<ApiResponse<AdvisorRecommendationResponse>> recommendation(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(advisorRecommendationService.get(id)));
    }

    @PostMapping("/recommendations/{id}/transition")
    public ResponseEntity<ApiResponse<AdvisorRecommendationResponse>> transition(
            @PathVariable Long id,
            @Valid @RequestBody RecommendationTransitionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                advisorRecommendationService.transition(id, request.getStatus(), request.getReason())));
    }

    @GetMapping("/recommendations/{id}/evaluation")
    public ResponseEntity<ApiResponse<RecommendationEvaluationResponse>> evaluation(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(recommendationEvaluationService.evaluate(id)));
    }
}
