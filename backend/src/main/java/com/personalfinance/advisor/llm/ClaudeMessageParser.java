package com.personalfinance.advisor.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public final class ClaudeMessageParser {

    private ClaudeMessageParser() {}

    public static String firstText(String body, ObjectMapper mapper) throws Exception {
        JsonNode root = mapper.readTree(body);
        JsonNode content = root.path("content");
        if (!content.isArray()) {
            throw new IllegalStateException("پاسخ مدل نامعتبر است");
        }
        for (JsonNode block : content) {
            if ("text".equals(block.path("type").asText()) && block.hasNonNull("text")) {
                String text = block.get("text").asText();
                if (text != null && !text.isBlank()) {
                    return text.trim();
                }
            }
        }
        throw new IllegalStateException("پاسخ مدل متن نداشت");
    }
}
