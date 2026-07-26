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

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .timeout(Duration.ofSeconds(25))
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
        if (host == null || !host.toLowerCase(Locale.ROOT).contains("tsetmc.com")) {
            throw new IllegalArgumentException("Only tsetmc.com hosts are allowed: " + host);
        }
    }

    private static HttpClient buildClient() {
        try {
            TrustManager[] trustAll = new TrustManager[]{
                    new X509TrustManager() {
                        @Override
                        public void checkClientTrusted(X509Certificate[] chain, String authType) {
                        }

                        @Override
                        public void checkServerTrusted(X509Certificate[] chain, String authType) {
                        }

                        @Override
                        public X509Certificate[] getAcceptedIssuers() {
                            return new X509Certificate[0];
                        }
                    }
            };
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, trustAll, new SecureRandom());
            return HttpClient.newBuilder()
                    .sslContext(sslContext)
                    .connectTimeout(Duration.ofSeconds(12))
                    .followRedirects(HttpClient.Redirect.NORMAL)
                    .build();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to create Iran exchange HTTP client", e);
        }
    }
}
