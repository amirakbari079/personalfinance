package com.personalfinance.advisor;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AdvisorRequestNormalizerTest {

    @Test
    void blankRiskIsUnspecified() {
        assertEquals("UNSPECIFIED", AdvisorRequestNormalizer.risk(null));
        assertEquals("MODERATE", AdvisorRequestNormalizer.risk(" moderate "));
    }

    @Test
    void rejectsUnknownHorizon() {
        assertNull(AdvisorRequestNormalizer.horizon(" "));
        assertEquals("6M", AdvisorRequestNormalizer.horizon("6m"));
        assertThrows(IllegalArgumentException.class, () -> AdvisorRequestNormalizer.horizon("2W"));
    }
}
