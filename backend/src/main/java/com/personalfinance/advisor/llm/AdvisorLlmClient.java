package com.personalfinance.advisor.llm;

import com.personalfinance.advisor.dto.AdvisorContextResponse;

public interface AdvisorLlmClient {

    AdvisorLlmResult complete(AdvisorContextResponse context, String question, String systemPrompt);
}
