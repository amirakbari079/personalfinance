package com.personalfinance.intelligence.service;

import com.personalfinance.intelligence.entity.AssetPrice;
import com.personalfinance.intelligence.entity.AssetPriceDaily;
import com.personalfinance.intelligence.repository.AssetPriceDailyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;

@Service
public class DailyPriceRollupService {

    private static final ZoneId TEHRAN = ZoneId.of("Asia/Tehran");

    private final AssetPriceDailyRepository dailyRepository;

    public DailyPriceRollupService(AssetPriceDailyRepository dailyRepository) {
        this.dailyRepository = dailyRepository;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void apply(AssetPrice tick) {
        LocalDate tradeDate = tick.getObservedAt().atZone(TEHRAN).toLocalDate();
        AssetPriceDaily daily = dailyRepository
                .findByAssetIdAndTradeDateAndCurrency(tick.getAssetId(), tradeDate, tick.getCurrency())
                .orElseGet(() -> newDay(tick, tradeDate));

        BigDecimal price = tick.getPrice();
        if (daily.getId() == null) {
            dailyRepository.save(daily);
            return;
        }
        if (price.compareTo(daily.getHigh()) > 0) {
            daily.setHigh(price);
        }
        if (price.compareTo(daily.getLow()) < 0) {
            daily.setLow(price);
        }
        daily.setClose(price);
        daily.setSourceProviderId(tick.getProviderId());
        daily.setSampleCount(daily.getSampleCount() + 1);
        dailyRepository.save(daily);
    }

    private static AssetPriceDaily newDay(AssetPrice tick, LocalDate tradeDate) {
        AssetPriceDaily daily = new AssetPriceDaily();
        daily.setAssetId(tick.getAssetId());
        daily.setTradeDate(tradeDate);
        daily.setCurrency(tick.getCurrency());
        daily.setUnit(tick.getUnit());
        daily.setOpen(tick.getPrice());
        daily.setHigh(tick.getPrice());
        daily.setLow(tick.getPrice());
        daily.setClose(tick.getPrice());
        daily.setSampleCount(1);
        daily.setSourceProviderId(tick.getProviderId());
        return daily;
    }
}
