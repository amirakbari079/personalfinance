package com.personalfinance.business.service;

import com.personalfinance.business.dto.BizCounterpartyRequest;
import com.personalfinance.business.dto.BizCounterpartyResponse;
import com.personalfinance.business.entity.BizCounterparty;
import com.personalfinance.business.repository.BizCounterpartyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class BizCounterpartyService {

    private final BizCounterpartyRepository counterpartyRepository;

    public BizCounterpartyService(BizCounterpartyRepository counterpartyRepository) {
        this.counterpartyRepository = counterpartyRepository;
    }

    public List<BizCounterpartyResponse> findAll(boolean onlyActive, String role) {
        List<BizCounterparty> list;
        if (role != null && !role.isBlank()) {
            list = counterpartyRepository.findByRoleAndIsActiveTrue(role.trim().toUpperCase());
        } else if (onlyActive) {
            list = counterpartyRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        } else {
            list = counterpartyRepository.findAllByOrderByCreatedAtDesc();
        }

        return list.stream()
                .map(BizCounterpartyResponse::fromEntity)
                .toList();
    }

    public BizCounterpartyResponse findById(Long id) {
        return counterpartyRepository.findById(id)
                .map(BizCounterpartyResponse::fromEntity)
                .orElseThrow(() -> new NoSuchElementException("طرف‌حساب یافت نشد: " + id));
    }

    @Transactional
    public BizCounterpartyResponse create(BizCounterpartyRequest request) {
        String cleanCode = request.getCode().trim();
        if (counterpartyRepository.existsByCode(cleanCode)) {
            throw new IllegalArgumentException("کد طرف‌حساب تکراری است: " + cleanCode);
        }

        BizCounterparty counterparty = new BizCounterparty();
        apply(counterparty, request);
        return BizCounterpartyResponse.fromEntity(counterpartyRepository.save(counterparty));
    }

    @Transactional
    public BizCounterpartyResponse update(Long id, BizCounterpartyRequest request) {
        BizCounterparty counterparty = counterpartyRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("طرف‌حساب یافت نشد: " + id));

        String cleanCode = request.getCode().trim();
        if (counterpartyRepository.existsByCodeAndIdNot(cleanCode, id)) {
            throw new IllegalArgumentException("کد طرف‌حساب در رکورد دیگری ثبت شده است: " + cleanCode);
        }

        apply(counterparty, request);
        return BizCounterpartyResponse.fromEntity(counterpartyRepository.save(counterparty));
    }

    @Transactional
    public BizCounterpartyResponse toggleActive(Long id) {
        BizCounterparty counterparty = counterpartyRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("طرف‌حساب یافت نشد: " + id));
        counterparty.setActive(!counterparty.isActive());
        return BizCounterpartyResponse.fromEntity(counterpartyRepository.save(counterparty));
    }

    @Transactional
    public void delete(Long id) {
        BizCounterparty counterparty = counterpartyRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("طرف‌حساب یافت نشد: " + id));
        // Soft delete / archive
        counterparty.setActive(false);
        counterpartyRepository.save(counterparty);
    }

    private void apply(BizCounterparty counterparty, BizCounterpartyRequest request) {
        counterparty.setCode(request.getCode().trim());
        counterparty.setName(request.getName().trim());
        counterparty.setRole(request.getRole().trim().toUpperCase());
        counterparty.setPhone(request.getPhone());
        if (request.getIsActive() != null) {
            counterparty.setActive(request.getIsActive());
        }
        counterparty.setNotes(request.getNotes());
    }
}
