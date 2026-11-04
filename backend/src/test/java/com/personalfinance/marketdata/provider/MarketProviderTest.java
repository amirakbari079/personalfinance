package com.personalfinance.marketdata.provider;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class MarketProviderTest {
    @Test void tgjuKeepsSourceTimeAndNormalizesPersianPrice() {
        var builder = RestClient.builder();
        var server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo("https://api.tgju.org/v1/widget/tmp?keys=137121,137203"))
                .andRespond(withSuccess("""
                    {"response":{"indicators":[{"name":"geram18","p":"۲۵۸٬۲۶۹٬۰۰۰",
                    "updated_at":"2026-11-04 12:30:36"}]}}
                    """, MediaType.APPLICATION_JSON));
        var quote = new TgjuProvider(builder, new ObjectMapper(), "137121", "137203")
                .fetchLiveIranianQuotes().getFirst();
        assertEquals(new BigDecimal("25826900"), quote.value());
        assertEquals(Instant.parse("2026-11-04T09:00:36Z"), quote.observedAt());
        server.verify();
    }
    @Test void nobitexUsesCurrentHostAndNestedMarketAndConvertsRialOnce() {
        var builder = RestClient.builder();
        var server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo("https://apiv2.nobitex.ir/market/stats?srcCurrency=usdt&dstCurrency=rls"))
                .andRespond(withSuccess("{\"stats\":{\"usdt-rls\":{\"latest\":\"2718400\"}}}", MediaType.APPLICATION_JSON));
        var provider = new NobitexProvider(builder, new ObjectMapper());
        assertEquals(new BigDecimal("271840"), provider.fetchUsdIrr().orElseThrow().value());
        server.verify();
    }

    @Test void coinGeckoSharesOneBatchForBothAssets() {
        var builder = RestClient.builder();
        var server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,pax-gold&vs_currencies=usd&include_last_updated_at=true"))
                .andRespond(withSuccess("{\"bitcoin\":{\"usd\":77569,\"last_updated_at\":1793730000},\"pax-gold\":{\"usd\":3931.76,\"last_updated_at\":1793730000}}", MediaType.APPLICATION_JSON));
        var provider = new CoinGeckoProvider(builder, new ObjectMapper());
        assertEquals(new BigDecimal("77569"), provider.fetchBtcUsd().orElseThrow().value());
        assertEquals(new BigDecimal("3931.76"), provider.fetchPaxgUsd().orElseThrow().value());
        server.verify();
    }

    @Test void rateLimitDoesNotTriggerSecondRequest() {
        var builder = RestClient.builder();
        var server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,pax-gold&vs_currencies=usd&include_last_updated_at=true"))
                .andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS));
        var provider = new CoinGeckoProvider(builder, new ObjectMapper());
        assertTrue(provider.fetchBtcUsd().isEmpty());
        assertTrue(provider.fetchPaxgUsd().isEmpty());
        server.verify();
    }

    @Test void exchangePreservesLargePricesAndMarketObservationTime() {
        var http = mock(IranExchangeHttpClient.class);
        when(http.get(anyString())).thenReturn("""
            {"closingPriceInfo":{"pClosing":12000000,"priceYesterday":10000000,
              "dEven":20261103,"hEven":123000}}
            """);
        var provider = new TsetmcBourseProvider(http, new ObjectMapper());
        var quote = provider.fetchQuote("123").orElseThrow();
        assertEquals(0, new BigDecimal("1200000").compareTo(quote.priceToman()));
        assertEquals(new BigDecimal("20.00"), quote.changePercent());
        assertEquals(Instant.parse("2026-11-03T09:00:00Z"), quote.observedAt());
        assertTrue(provider.fetchQuote("../../bad").isEmpty());
        verify(http, times(1)).get(anyString());
    }
}
