package com.personalfinance.advisor.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalfinance.advisor.llm.AdvisorCliPaths;
import com.personalfinance.advisor.llm.AdvisorLlmClient;
import com.personalfinance.advisor.llm.CliAdvisorLlmClient;
import com.personalfinance.advisor.llm.ClaudeAdvisorLlmClient;
import com.personalfinance.advisor.llm.FakeAdvisorLlmClient;
import com.personalfinance.advisor.llm.ProcessAdvisorCliExecutor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

import java.nio.file.Path;
import java.time.Duration;

@Configuration
public class AdvisorLlmConfig {

    private static final Logger log = LoggerFactory.getLogger(AdvisorLlmConfig.class);

    @Bean
    public AdvisorLlmClient advisorLlmClient(
            @Value("${app.advisor.llm.api-key:}") String apiKey,
            @Value("${app.advisor.llm.model:claude-sonnet-4-20250514}") String model,
            @Value("${app.advisor.llm.cli-enabled:true}") boolean cliEnabled,
            @Value("${app.advisor.llm.cli-command:}") String cliCommand,
            @Value("${app.advisor.llm.cli-model:}") String cliModel,
            @Value("${app.advisor.llm.cli-timeout-seconds:180}") int cliTimeoutSeconds,
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper) {
        if (apiKey != null && !apiKey.isBlank()) {
            log.info("Advisor LLM: Anthropic HTTP");
            return new ClaudeAdvisorLlmClient(apiKey, model, restClientBuilder.build(), objectMapper);
        }
        Path command = cliEnabled ? AdvisorCliPaths.resolve(cliCommand) : null;
        if (command != null) {
            log.info("Advisor LLM: CLI {}", command);
            return new CliAdvisorLlmClient(
                    command,
                    cliModel,
                    Duration.ofSeconds(Math.max(30, cliTimeoutSeconds)),
                    objectMapper,
                    new ProcessAdvisorCliExecutor());
        }
        log.warn("Advisor LLM: fake client (no API key and no CLI)");
        return new FakeAdvisorLlmClient();
    }
}
