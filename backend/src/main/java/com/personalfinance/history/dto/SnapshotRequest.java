package com.personalfinance.history.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class SnapshotRequest {

    @NotNull(message = "مقدار الزامی است")
    @PositiveOrZero(message = "مقدار باید غیرمنفی باشد")
    private Long value;

    @NotBlank(message = "تاریخ ثبت الزامی است")
    private String recordedDateJalali;

    private String notes;

    public Long getValue() { return value; }
    public void setValue(Long value) { this.value = value; }

    public String getRecordedDateJalali() { return recordedDateJalali; }
    public void setRecordedDateJalali(String recordedDateJalali) { this.recordedDateJalali = recordedDateJalali; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
