package com.personalfinance.advisor.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalfinance.advisor.dto.AdvisorContextResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

public class CliAdvisorLlmClient implements AdvisorLlmClient {

    public static final String PROVIDER = "CLI";
    public static final String DEFAULT_MODEL = "cursor-agent";
    static final String PROMPT_FILE = "prompt.txt";
    static final String RUN_INSTRUCTION =
            "Read prompt.txt in this workspace and answer it. Reply in Persian. Do not edit files or run commands.";

    private static final Logger log = LoggerFactory.getLogger(CliAdvisorLlmClient.class);

    private final Path command;
    private final String model;
    private final Duration timeout;
    private final ObjectMapper objectMapper;
    private final AdvisorCliExecutor executor;

    public CliAdvisorLlmClient(
            Path command,
            String model,
            Duration timeout,
            ObjectMapper objectMapper,
            AdvisorCliExecutor executor) {
        this.command = command;
        this.model = model == null || model.isBlank() ? DEFAULT_MODEL : model.trim();
        this.timeout = timeout;
        this.objectMapper = objectMapper;
        this.executor = executor;
    }

    @Override
    public AdvisorLlmResult complete(AdvisorContextResponse context, String question, String systemPrompt) {
        Path workspace = null;
        try {
            workspace = Files.createTempDirectory("advisor-cli-");
            Files.writeString(workspace.resolve(PROMPT_FILE), buildPrompt(context, question, systemPrompt), StandardCharsets.UTF_8);
            String text = executor.run(commandLine(workspace), workspace, timeout);
            return new AdvisorLlmResult(model, text, false, PROVIDER);
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Advisor CLI client failed: {}", e.getMessage());
            throw new IllegalStateException("فراخوانی مشاور CLI ناموفق بود");
        } finally {
            deleteQuietly(workspace);
        }
    }

    List<String> commandLine(Path workspace) {
        List<String> args = new ArrayList<>();
        String executable = command.toAbsolutePath().toString();
        if (executable.toLowerCase().endsWith(".cmd") || executable.toLowerCase().endsWith(".bat")) {
            args.add("cmd.exe");
            args.add("/c");
        }
        args.add(executable);
        args.add("-p");
        args.add("--mode");
        args.add("ask");
        args.add("--output-format");
        args.add("text");
        args.add("--trust");
        args.add("--workspace");
        args.add(workspace.toAbsolutePath().toString());
        args.add(RUN_INSTRUCTION);
        return args;
    }

    String buildPrompt(AdvisorContextResponse context, String question, String systemPrompt) throws Exception {
        return (systemPrompt == null ? "" : systemPrompt.trim())
                + "\n\nCONTEXT JSON:\n"
                + objectMapper.writeValueAsString(context)
                + "\n\nQUESTION:\n"
                + question;
    }

    private static void deleteQuietly(Path workspace) {
        if (workspace == null) {
            return;
        }
        try {
            Path prompt = workspace.resolve(PROMPT_FILE);
            Files.deleteIfExists(prompt);
            Files.deleteIfExists(workspace);
        } catch (Exception ignored) {
            // temp cleanup must not hide the CLI result
        }
    }
}
