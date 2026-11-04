package com.personalfinance.advisor.llm;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class ProcessAdvisorCliExecutor implements AdvisorCliExecutor {

    private static final Logger log = LoggerFactory.getLogger(ProcessAdvisorCliExecutor.class);

    @Override
    public String run(List<String> command, Path workspace, Duration timeout) {
        ProcessBuilder builder = new ProcessBuilder(command);
        builder.directory(workspace.toFile());
        builder.redirectErrorStream(true);
        try {
            Process process = builder.start();
            boolean finished = process.waitFor(timeout.toMillis(), TimeUnit.MILLISECONDS);
            if (!finished) {
                process.destroyForcibly();
                throw new IllegalStateException("زمان پاسخ مشاور CLI تمام شد");
            }
            String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
            if (process.exitValue() != 0) {
                log.warn("Advisor CLI exited {}: {}", process.exitValue(), abbreviate(output));
                throw new IllegalStateException("فراخوانی مشاور CLI ناموفق بود");
            }
            if (output.isBlank()) {
                throw new IllegalStateException("مشاور CLI پاسخی برنگرداند");
            }
            return output;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("فراخوانی مشاور CLI قطع شد");
        } catch (IOException e) {
            log.warn("Advisor CLI failed to start: {}", e.getMessage());
            throw new IllegalStateException("اجرای مشاور CLI ممکن نشد");
        }
    }

    private static String abbreviate(String text) {
        if (text == null) {
            return "";
        }
        return text.length() <= 400 ? text : text.substring(0, 400);
    }
}
