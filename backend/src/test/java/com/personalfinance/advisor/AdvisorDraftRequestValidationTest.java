package com.personalfinance.advisor;

import com.personalfinance.advisor.dto.AdvisorDraftRequest;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

class AdvisorDraftRequestValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void eightHundredCharactersIsAccepted() {
        AdvisorDraftRequest request = new AdvisorDraftRequest();
        request.setQuestion("الف".repeat(268));
        assertTrue(request.getQuestion().length() > 800);
        assertTrue(validator.validate(request).isEmpty());
    }

    @Test
    void fourThousandCharactersIsTheLimit() {
        AdvisorDraftRequest ok = new AdvisorDraftRequest();
        ok.setQuestion("a".repeat(4000));
        assertTrue(validator.validate(ok).isEmpty());

        AdvisorDraftRequest tooLong = new AdvisorDraftRequest();
        tooLong.setQuestion("a".repeat(4001));
        assertTrue(validator.validate(tooLong).stream()
                .anyMatch(v -> v.getMessage().contains("۴۰۰۰")));
    }
}
