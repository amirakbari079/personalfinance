package com.personalfinance.intelligence.service;

import com.personalfinance.intelligence.dto.DataUpdateResponse;
import com.personalfinance.intelligence.entity.DataUpdate;
import com.personalfinance.intelligence.entity.DataUpdateStatus;
import com.personalfinance.intelligence.repository.DataUpdateRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class FinancialDataUpdateService {

    private final DataUpdateRepository dataUpdateRepository;
    private final FinancialDataUpdateRunner runner;

    public FinancialDataUpdateService(
            DataUpdateRepository dataUpdateRepository,
            FinancialDataUpdateRunner runner) {
        this.dataUpdateRepository = dataUpdateRepository;
        this.runner = runner;
    }

    public synchronized DataUpdateResponse enqueue(String triggerType) {
        DataUpdate existing = activeOrRecentJob();
        if (existing != null) return DataUpdateResponse.from(existing);
        DataUpdate job = createJob(triggerType);
        runner.executeAsync(job.getId());
        return DataUpdateResponse.from(job);
    }

    public synchronized DataUpdateResponse runSynchronous(String triggerType) {
        DataUpdate existing = activeOrRecentJob();
        if (existing != null) return DataUpdateResponse.from(existing);
        DataUpdate job = createJob(triggerType);
        return DataUpdateResponse.from(runner.execute(job.getId()));
    }

    public List<DataUpdateResponse> findRecent() {
        return dataUpdateRepository.findTop50ByOrderByCreatedAtDesc()
                .stream()
                .map(DataUpdateResponse::from)
                .toList();
    }

    public DataUpdateResponse findById(Long id) {
        return DataUpdateResponse.from(dataUpdateRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("جاب بروزرسانی یافت نشد: " + id)));
    }

    private DataUpdate activeOrRecentJob() {
        var now = java.time.Instant.now();
        for (DataUpdate job : dataUpdateRepository.findTop50ByOrderByCreatedAtDesc()) {
            if (job.getStatus() == DataUpdateStatus.RUNNING || job.getStatus() == DataUpdateStatus.QUEUED) {
                if (job.getCreatedAt().isAfter(now.minusSeconds(600))) return job;
                job.setStatus(DataUpdateStatus.FAILED);
                job.setCompletedAt(now);
                job.setErrorSummary("Previous update did not finish; retry allowed");
                dataUpdateRepository.save(job);
            } else if (job.getCompletedAt() != null && job.getCompletedAt().isAfter(now.minusSeconds(30))) {
                return job;
            }
        }
        return null;
    }

    private DataUpdate createJob(String triggerType) {
        DataUpdate job = new DataUpdate();
        job.setStatus(DataUpdateStatus.QUEUED);
        job.setTriggerType(triggerType == null ? "MANUAL" : triggerType);
        return dataUpdateRepository.save(job);
    }
}
