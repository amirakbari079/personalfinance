package com.personalfinance.marketdata.dto;

public record BourseInstrumentDto(
        String insCode,
        String symbol,
        String name,
        String marketLabel) {}
