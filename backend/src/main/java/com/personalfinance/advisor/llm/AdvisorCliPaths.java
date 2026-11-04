package com.personalfinance.advisor.llm;

import java.nio.file.Files;
import java.nio.file.Path;

public final class AdvisorCliPaths {

    private AdvisorCliPaths() {}

    public static Path resolve(String configured) {
        if (configured != null && !configured.isBlank()) {
            Path explicit = Path.of(configured.trim());
            if (Files.isRegularFile(explicit)) {
                return explicit;
            }
        }
        String localAppData = System.getenv("LOCALAPPDATA");
        if (localAppData != null && !localAppData.isBlank()) {
            Path agent = Path.of(localAppData, "cursor-agent", "agent.cmd");
            if (Files.isRegularFile(agent)) {
                return agent;
            }
        }
        return null;
    }
}
