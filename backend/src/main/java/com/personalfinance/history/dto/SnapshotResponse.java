package com.personalfinance.history.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

public record SnapshotResponse(
        Long id,
        Long value,
        String recordedDateJalali,
        Long deltaFromPrevious,
        String notes,
        Instant createdAt,
        @JsonProperty("isLatest") boolean isLatest
) {}
