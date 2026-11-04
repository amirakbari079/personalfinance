package com.personalfinance.advisor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalfinance.advisor.llm.ClaudeMessageParser;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ClaudeMessageParserTest {

    @Test
    void readsFirstTextBlock() throws Exception {
        String body = """
                {"content":[{"type":"text","text":"قیمت را از کانتکست بخوان"}]}
                """;
        assertEquals("قیمت را از کانتکست بخوان", ClaudeMessageParser.firstText(body, new ObjectMapper()));
    }

    @Test
    void rejectsEmptyContent() {
        assertThrows(IllegalStateException.class, () ->
                ClaudeMessageParser.firstText("{\"content\":[]}", new ObjectMapper()));
    }
}
