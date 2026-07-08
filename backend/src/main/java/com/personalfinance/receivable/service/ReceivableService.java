package com.personalfinance.receivable.service;

import com.personalfinance.common.JalaliDateConverter;
import com.personalfinance.receivable.dto.ReceivableRequest;
import com.personalfinance.receivable.dto.ReceivableResponse;
import com.personalfinance.receivable.entity.Receivable;
import com.personalfinance.receivable.repository.ReceivableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ReceivableService {

    private final ReceivableRepository receivableRepository;
    private final JalaliDateConverter jalaliDateConverter;

    public ReceivableService(ReceivableRepository receivableRepository,
                             JalaliDateConverter jalaliDateConverter) {
        this.receivableRepository = receivableRepository;
        this.jalaliDateConverter = jalaliDateConverter;
    }

    public List<ReceivableResponse> findAll() {
        return receivableRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ReceivableResponse create(ReceivableRequest request) {
        Receivable receivable = new Receivable();
        apply(receivable, request);
        return toResponse(receivableRepository.save(receivable));
    }

    @Transactional
    public ReceivableResponse update(Long id, ReceivableRequest request) {
        Receivable receivable = receivableRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("طلب یافت نشد: " + id));
        apply(receivable, request);
        return toResponse(receivableRepository.save(receivable));
    }

    @Transactional
    public void delete(Long id) {
        if (!receivableRepository.existsById(id)) {
            throw new NoSuchElementException("طلب یافت نشد: " + id);
        }
        receivableRepository.deleteById(id);
    }

    public Long totalOutstanding() {
        return receivableRepository.sumOutstanding();
    }

    private void apply(Receivable receivable, ReceivableRequest request) {
        if (request.getReceivedAmount() > request.getOriginalAmount()) {
            throw new IllegalArgumentException("مبلغ دریافتی نمی‌تواند بیشتر از مبلغ اصلی باشد");
        }
        receivable.setDebtorName(request.getDebtorName());
        receivable.setOriginalAmount(request.getOriginalAmount());
        receivable.setCreatedDate(jalaliDateConverter.toGregorian(request.getCreatedDate()));
        receivable.setReceivedAmount(request.getReceivedAmount());
        receivable.setNotes(request.getNotes());
    }

    private ReceivableResponse toResponse(Receivable receivable) {
        return ReceivableResponse.from(
                receivable, jalaliDateConverter.toJalali(receivable.getCreatedDate()));
    }
}
