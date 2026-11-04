package com.personalfinance.marketdata.provider;

import com.personalfinance.account.entity.Investment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Optional;

@Component
public class BourseInstrumentResolver {

    public record ResolvedInstrument(String insCode, String label) {}

    private final String ayarInsCode;
    private final String narangeInsCode;

    public BourseInstrumentResolver(
            @Value("${app.market.etf.ayar-ins-code:34144395039913458}") String ayarInsCode,
            @Value("${app.market.etf.narange-ins-code:35831329532779850}") String narangeInsCode) {
        this.ayarInsCode = ayarInsCode;
        this.narangeInsCode = narangeInsCode;
    }

    public Optional<ResolvedInstrument> resolve(Investment investment) {
        if (investment == null || investment.getAssetType() == null) {
            return Optional.empty();
        }
        if (investment.getAssetType() != com.personalfinance.account.entity.InvestmentType.STOCK) {
            return Optional.empty();
        }

        String unit = investment.getNativeUnit();
        if (unit != null && unit.startsWith("b:")) {
            String insCode = unit.substring(2).trim();
            if ("68603452107668866".equals(insCode)) insCode = ayarInsCode;
            if ("120079097679462".equals(insCode)) insCode = narangeInsCode;
            if (!insCode.isBlank()) {
                return Optional.of(new ResolvedInstrument(insCode, investment.getName()));
            }
        }

        String normalized = normalize(investment.getName()) + " " + normalize(unit);
        if (containsAny(normalized, "عیار", "ayar")) {
            return Optional.of(new ResolvedInstrument(ayarInsCode, investment.getName()));
        }
        if (containsAny(normalized, "نارنج", "narange")) {
            return Optional.of(new ResolvedInstrument(narangeInsCode, investment.getName()));
        }
        return Optional.empty();
    }

    public Optional<ResolvedInstrument> resolveByEtfKey(String etfKey) {
        if (etfKey == null) {
            return Optional.empty();
        }
        return switch (etfKey.trim().toUpperCase(Locale.ROOT)) {
            case "NARANGE" -> Optional.of(new ResolvedInstrument(narangeInsCode, "صندوق نارنج"));
            case "AYAR" -> Optional.of(new ResolvedInstrument(ayarInsCode, "صندوق عیار"));
            default -> Optional.empty();
        };
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private static boolean containsAny(String haystack, String... needles) {
        for (String needle : needles) {
            if (haystack.contains(needle.toLowerCase(Locale.ROOT))) {
                return true;
            }
        }
        return false;
    }
}
