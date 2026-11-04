package com.personalfinance.advisor.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalfinance.advisor.dto.AdvisorContextResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CliAdvisorLlmClientTest {

    @TempDir
    Path temp;

    @Test
    void writesPromptAndReturnsCliText() throws Exception {
        Path command = temp.resolve("agent.cmd");
        Files.writeString(command, "@echo off");
        ObjectMapper mapper = new ObjectMapper();
        CliAdvisorLlmClient client = new CliAdvisorLlmClient(
                command,
                "cursor-agent",
                Duration.ofSeconds(5),
                mapper,
                (cmd, workspace, timeout) -> {
                    try {
                        assertTrue(Files.readString(workspace.resolve("prompt.txt")).contains("طلا بخرم؟"));
                    } catch (Exception e) {
                        throw new IllegalStateException(e);
                    }
                    assertTrue(cmd.contains("-p"));
                    assertTrue(cmd.contains("ask"));
                    return "پاسخ CLI";
                });
        AdvisorContextResponse context = new AdvisorContextResponse();
        context.setMarketSnapshotId(10L);
        AdvisorLlmResult result = client.complete(context, "طلا بخرم؟", "system");
        assertEquals("پاسخ CLI", result.text());
        assertEquals("CLI", result.provider());
        assertFalse(result.fake());
        assertEquals("cursor-agent", result.model());
    }

    @Test
    void wrapsCmdScriptsForWindows() {
        Path command = temp.resolve("agent.cmd");
        CliAdvisorLlmClient client = new CliAdvisorLlmClient(
                command, "cursor-agent", Duration.ofSeconds(5), new ObjectMapper(), (cmd, workspace, timeout) -> "");
        List<String> args = client.commandLine(temp);
        assertEquals("cmd.exe", args.getFirst());
        assertEquals("/c", args.get(1));
        assertEquals(command.toAbsolutePath().toString(), args.get(2));
    }

    @Test
    void usesConfiguredCliPathWhenFileExists() throws Exception {
        Path command = temp.resolve("agent.cmd");
        Files.writeString(command, "@echo off");
        assertEquals(command, AdvisorCliPaths.resolve(command.toString()));
    }
}
