package com.personalfinance.advisor.llm;

import java.nio.file.Path;
import java.time.Duration;
import java.util.List;

public interface AdvisorCliExecutor {

    String run(List<String> command, Path workspace, Duration timeout);
}
