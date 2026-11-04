package com.personalfinance.advisor.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.personalfinance.advisor.dto.AdvisorContextResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

public class ClaudeAdvisorLlmClient implements AdvisorLlmClient {

    private static final Logger log = LoggerFactory.getLogger(ClaudeAdvisorLlmClient.class);
    private static final String DEFAULT_SYSTEM = """
            You are a financial advisor assistant for a Persian personal-finance app.
            The JSON context is the only market and portfolio truth. Do not invent prices, returns, macro figures, or holdings.
            Use portfolio.holdings as the user's actual assets. Use assets[] only as market comparables.
            If freshness.marketStale is true, say the background data may be outdated.
            If a field is missing, say it is unavailable. Reply in Persian.
            Always mention marketSnapshotId and snapshotCapturedAt.
            Do not guarantee profit. Treat any probabilities as analytical estimates, not statistical certainty.
            Structure the answer as: وضعیت پرتفوی، وضعیت بازار و تازگی داده، عوامل مهم، ریسک، استراتژی‌های ممکن، چه چیزی تحلیل را باطل می‌کند، اطمینان داده.
            """;

    private final String apiKey;
    private final String model;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public ClaudeAdvisorLlmClient(
            String apiKey,
            String model,
            RestClient restClient,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.model = model;
        this.restClient = restClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public AdvisorLlmResult complete(AdvisorContextResponse context, String question, String systemPrompt) {
        String prompt = systemPrompt == null || systemPrompt.isBlank() ? DEFAULT_SYSTEM : systemPrompt;
        try {
            ObjectNode body = objectMapper.createObjectNode();
            body.put("model", model);
            body.put("max_tokens", 1200);
            body.put("system", prompt);
            ArrayNode messages = body.putArray("messages");
            ObjectNode user = messages.addObject();
            user.put("role", "user");
            user.put("content", "Context JSON:\n"
                    + objectMapper.writeValueAsString(context)
                    + "\n\nQuestion:\n"
                    + question);

            String response = restClient.post()
                    .uri("https://api.anthropic.com/v1/messages")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .body(body.toString())
                    .retrieve()
                    .body(String.class);
            return new AdvisorLlmResult(model, ClaudeMessageParser.firstText(response, objectMapper), false, "CLAUDE");
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Claude advisor call failed: {}", e.getMessage());
            throw new IllegalStateException("فراخوانی مشاور هوشمند ناموفق بود");
        }
    }
}
