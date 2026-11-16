package com.personalfinance.marketdata.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.net.ssl.SSLContext;
import javax.net.ssl.HttpsURLConnection;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

/**
 * HTTP client for Iranian exchange hosts (TSETMC CDN).
 * Java's default trust store often rejects TSETMC TLS certificates on Windows.
 */
@Component
public class IranExchangeHttpClient {

    private static final Logger log = LoggerFactory.getLogger(IranExchangeHttpClient.class);

    private final SSLContext windowsSslContext;

    public IranExchangeHttpClient() {
        this.windowsSslContext = buildWindowsSslContext();
    }

    public String get(String url) {
        URI uri = URI.create(url);
        assertTsetmcHost(uri.getHost());
        if (!"https".equals(uri.getScheme())) throw new IllegalArgumentException("HTTPS required");

        for (int attempt = 1; attempt <= 2; attempt++) {
            HttpsURLConnection connection = null;
            try {
                connection = (HttpsURLConnection) uri.toURL().openConnection();
                connection.setInstanceFollowRedirects(false);
                connection.setConnectTimeout(4_000);
                connection.setReadTimeout(6_000);
                connection.setRequestMethod("GET");
                connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
                connection.setRequestProperty("Accept", "application/json, text/plain, */*");
                connection.setRequestProperty("Referer", "https://www.tsetmc.com/");
                if (windowsSslContext != null) {
                    connection.setSSLSocketFactory(windowsSslContext.getSocketFactory());
                }
                int status = connection.getResponseCode();
                if (status >= 200 && status < 300) {
                    try (var input = connection.getInputStream()) {
                        return new String(input.readAllBytes(), StandardCharsets.UTF_8);
                    }
                }
                log.warn("TSETMC HTTP {} status={}", uri, status);
                return null;
            } catch (java.io.IOException e) {
                if (attempt == 2) {
                    log.warn("TSETMC HTTP {} failed after retry: {}", uri, e.getMessage());
                    return null;
                }
                log.info("TSETMC HTTP {} transient failure; retrying once", uri);
            } finally {
                if (connection != null) connection.disconnect();
            }
        }
        return null;
    }

    private static void assertTsetmcHost(String host) {
        if (host == null || !(host.equalsIgnoreCase("tsetmc.com") || host.toLowerCase(Locale.ROOT).endsWith(".tsetmc.com"))) {
            throw new IllegalArgumentException("Only tsetmc.com hosts are allowed: " + host);
        }
    }

    private static SSLContext buildWindowsSslContext() {
        if (!System.getProperty("os.name", "").toLowerCase(Locale.ROOT).contains("windows")) {
            return null;
        }
        try {
            // TSETMC's chain is accepted by Windows but not always by the bundled
            // Java trust store. Keep normal certificate and hostname validation.
            var store = java.security.KeyStore.getInstance("Windows-ROOT");
            store.load(null, null);
            var factory = javax.net.ssl.TrustManagerFactory.getInstance(
                    javax.net.ssl.TrustManagerFactory.getDefaultAlgorithm());
            factory.init(store);
            var context = SSLContext.getInstance("TLS");
            context.init(null, factory.getTrustManagers(), null);
            return context;
        } catch (Exception e) {
            log.warn("Windows trust store unavailable; using Java trust store: {}", e.getMessage());
            return null;
        }
    }
}
