package com.personalfinance.business.service;

import com.personalfinance.business.dto.BizAccountRequest;
import com.personalfinance.business.dto.BizAccountResponse;
import com.personalfinance.business.entity.BizAccount;
import com.personalfinance.business.repository.BizAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class BizAccountService {

    private final BizAccountRepository accountRepository;

    public BizAccountService(BizAccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public List<BizAccountResponse> findAll(boolean onlyActive) {
        List<BizAccount> list = onlyActive
                ? accountRepository.findByIsActiveTrueOrderByCreatedAtDesc()
                : accountRepository.findAllByOrderByCreatedAtDesc();

        return list.stream()
                .map(BizAccountResponse::fromEntity)
                .toList();
    }

    public BizAccountResponse findById(Long id) {
        return accountRepository.findById(id)
                .map(BizAccountResponse::fromEntity)
                .orElseThrow(() -> new NoSuchElementException("حساب کسب‌وکار یافت نشد: " + id));
    }

    public Long totalOpeningBalance() {
        return accountRepository.sumOpeningBalanceActive();
    }

    @Transactional
    public BizAccountResponse create(BizAccountRequest request) {
        BizAccount account = new BizAccount();
        apply(account, request);
        return BizAccountResponse.fromEntity(accountRepository.save(account));
    }

    @Transactional
    public BizAccountResponse update(Long id, BizAccountRequest request) {
        BizAccount account = accountRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("حساب کسب‌وکار یافت نشد: " + id));
        apply(account, request);
        return BizAccountResponse.fromEntity(accountRepository.save(account));
    }

    @Transactional
    public BizAccountResponse toggleActive(Long id) {
        BizAccount account = accountRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("حساب کسب‌وکار یافت نشد: " + id));
        account.setActive(!account.isActive());
        return BizAccountResponse.fromEntity(accountRepository.save(account));
    }

    @Transactional
    public void delete(Long id) {
        BizAccount account = accountRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("حساب کسب‌وکار یافت نشد: " + id));
        // Soft archive
        account.setActive(false);
        accountRepository.save(account);
    }

    private void apply(BizAccount account, BizAccountRequest request) {
        account.setName(request.getName().trim());
        account.setType(request.getType().trim().toUpperCase());
        account.setAccountNumber(request.getAccountNumber());
        account.setOpeningBalance(request.getOpeningBalance() != null ? request.getOpeningBalance() : 0L);
        account.setOpeningBalanceDate(request.getOpeningBalanceDate() != null ? request.getOpeningBalanceDate() : LocalDate.now());
        if (request.getIsActive() != null) {
            account.setActive(request.getIsActive());
        }
        account.setNotes(request.getNotes());
    }
}
