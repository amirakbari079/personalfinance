package com.personalfinance.account.service;

import com.personalfinance.account.dto.AccountRequest;
import com.personalfinance.account.dto.AccountResponse;
import com.personalfinance.account.entity.Account;
import com.personalfinance.account.repository.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class AccountService {

    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public List<AccountResponse> findAll() {
        return accountRepository.findAll()
                .stream()
                .map(AccountResponse::from)
                .toList();
    }

    @Transactional
    public AccountResponse create(AccountRequest request) {
        Account account = new Account();
        apply(account, request);
        return AccountResponse.from(accountRepository.save(account));
    }

    @Transactional
    public AccountResponse update(Long id, AccountRequest request) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("حساب یافت نشد: " + id));
        apply(account, request);
        return AccountResponse.from(accountRepository.save(account));
    }

    @Transactional
    public void delete(Long id) {
        if (!accountRepository.existsById(id)) {
            throw new NoSuchElementException("حساب یافت نشد: " + id);
        }
        accountRepository.deleteById(id);
    }

    public Long totalBalance() {
        return accountRepository.sumAllBalances();
    }

    private void apply(Account account, AccountRequest request) {
        account.setName(request.getName());
        account.setType(request.getType());
        account.setBalance(request.getBalance());
        account.setNotes(request.getNotes());
    }
}
