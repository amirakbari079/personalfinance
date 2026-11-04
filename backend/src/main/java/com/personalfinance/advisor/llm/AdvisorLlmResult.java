package com.personalfinance.advisor.llm;

public record AdvisorLlmResult(String model, String text, boolean fake, String provider) {

    public AdvisorLlmResult(String model, String text, boolean fake) {
        this(model, text, fake, fake ? "FAKE" : "CLAUDE");
    }
}
