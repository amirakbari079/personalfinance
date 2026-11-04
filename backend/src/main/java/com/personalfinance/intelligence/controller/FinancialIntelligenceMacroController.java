package com.personalfinance.intelligence.controller;

import com.personalfinance.common.ApiResponse;
import com.personalfinance.intelligence.dto.MacroIndicatorResponse;
import com.personalfinance.intelligence.service.MacroQueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/financial-intelligence")
public class FinancialIntelligenceMacroController {

    private final MacroQueryService macroQueryService;

    public FinancialIntelligenceMacroController(MacroQueryService macroQueryService) {
        this.macroQueryService = macroQueryService;
    }

    @GetMapping("/macro")
    public ResponseEntity<ApiResponse<List<MacroIndicatorResponse>>> macro() {
        return ResponseEntity.ok(ApiResponse.ok(macroQueryService.latest()));
    }
}
