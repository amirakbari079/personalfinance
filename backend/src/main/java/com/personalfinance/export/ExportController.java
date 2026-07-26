package com.personalfinance.export;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.personalfinance.common.ApiResponse;
import com.personalfinance.export.dto.AiPortfolioExportResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/v1/export")
public class ExportController {

    private final AiPortfolioExportService aiPortfolioExportService;
    private final ObjectMapper objectMapper;

    public ExportController(AiPortfolioExportService aiPortfolioExportService, ObjectMapper objectMapper) {
        this.aiPortfolioExportService = aiPortfolioExportService;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/ai-portfolio")
    public ResponseEntity<ApiResponse<AiPortfolioExportResponse>> getAiPortfolio() {
        return ResponseEntity.ok(ApiResponse.ok(aiPortfolioExportService.buildExport()));
    }

    @GetMapping("/ai-portfolio/download")
    public void downloadAiPortfolio(HttpServletResponse response) throws IOException {
        AiPortfolioExportResponse export = aiPortfolioExportService.buildExport();

        response.setContentType("application/json; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"portfolio-ai.json\"");

        ObjectMapper writer = objectMapper.copy();
        writer.enable(SerializationFeature.INDENT_OUTPUT);
        byte[] bytes = writer.writeValueAsString(export).getBytes(StandardCharsets.UTF_8);
        response.getOutputStream().write(bytes);
        response.getOutputStream().flush();
    }
}
