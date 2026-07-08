package com.personalfinance.standby.service;

import com.personalfinance.common.JalaliDateConverter;
import com.personalfinance.standby.dto.StandbyRequest;
import com.personalfinance.standby.dto.StandbyResponse;
import com.personalfinance.standby.entity.Standby;
import com.personalfinance.standby.repository.StandbyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class StandbyService {

    private final StandbyRepository standbyRepository;
    private final JalaliDateConverter jalaliDateConverter;

    public StandbyService(StandbyRepository standbyRepository,
                          JalaliDateConverter jalaliDateConverter) {
        this.standbyRepository = standbyRepository;
        this.jalaliDateConverter = jalaliDateConverter;
    }

    public List<StandbyResponse> findAll() {
        return standbyRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public StandbyResponse create(StandbyRequest request) {
        Standby standby = new Standby();
        apply(standby, request);
        return toResponse(standbyRepository.save(standby));
    }

    @Transactional
    public StandbyResponse update(Long id, StandbyRequest request) {
        Standby standby = standbyRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("کالای معوق یافت نشد: " + id));
        apply(standby, request);
        return toResponse(standbyRepository.save(standby));
    }

    @Transactional
    public void delete(Long id) {
        if (!standbyRepository.existsById(id)) {
            throw new NoSuchElementException("کالای معوق یافت نشد: " + id);
        }
        standbyRepository.deleteById(id);
    }

    public Long totalValue() {
        return standbyRepository.sumTotalValue();
    }

    private void apply(Standby standby, StandbyRequest request) {
        standby.setItemLabel(request.getItemLabel());
        standby.setQuantity(request.getQuantity());
        standby.setExpectedUnitPrice(request.getExpectedUnitPrice());
        standby.setDateAdded(jalaliDateConverter.toGregorian(request.getDateAdded()));
        standby.setNotes(request.getNotes());
    }

    private StandbyResponse toResponse(Standby standby) {
        return StandbyResponse.from(standby, jalaliDateConverter.toJalali(standby.getDateAdded()));
    }
}
