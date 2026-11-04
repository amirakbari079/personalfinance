package com.personalfinance.marketdata.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.time.Duration;
import java.util.Locale;

/**
 * HTTP client for Iranian exchange hosts (TSETMC CDN).
 * Java's default trust store often rejects TSETMC TLS certificates on Windows.
 */
@Component
public class IranExchangeHttpClient {

    private static final Logger log = LoggerFactory.getLogger(IranExchangeHttpClient.class);

    private final HttpClient httpClient;

    public IranExchangeHttpClient() {
        this.httpClient = buildClient();
    }

    public String get(String url) {
        URI uri = URI.create(url);
        assertTsetmcHost(uri.getHost());
        if (!"https".equals(uri.getScheme())) throw new IllegalArgumentException("HTTPS required");

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .timeout(Duration.ofSeconds(10))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .header("Accept", "application/json, text/plain, */*")
                    .header("Referer", "https://www.tsetmc.com/")
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return response.body();
            }
            log.warn("TSETMC HTTP {} status={}", uri, response.statusCode());
        } catch (Exception e) {
            log.warn("TSETMC HTTP {} failed: {}", uri, e.getMessage());
        }
        return null;
    }

    private static void assertTsetmcHost(String host) {
        if (host == null || !(host.equalsIgnoreCase("tsetmc.com") || host.toLowerCase(Locale.ROOT).endsWith(".tsetmc.com"))) {
            throw new IllegalArgumentException("Only tsetmc.com hosts are allowed: " + host);
        }
    }

    private static HttpClient buildClient() {
        var builder = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .followRedirects(HttpClient.Redirect.NEVER);
        if (System.getProperty("os.name", "").toLowerCase(Locale.ROOT).contains("windows")) {
            try {
                // Use the OS trust anchors on Windows, retaining certificate and hostname validation.
                var store = java.security.KeyStore.getInstance("Windows-ROOT");
                store.load(null, null);
                var factory = javax.net.ssl.TrustManagerFactory.getInstance(javax.net.ssl.TrustManagerFactory.getDefaultAlgorithm());
                factory.init(store);
                var context = SSLContext.getInstance("TLS");
                context.init(null, factory.getTrustManagers(), null);
                builder.sslContext(context);
            } catch (Exception e) {
                log.warn("Windows trust store unavailable; using Java trust store: {}", e.getMessage());
            }
        }
        return builder.build();
    }
}
