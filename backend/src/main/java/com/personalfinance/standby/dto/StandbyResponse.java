package com.personalfinance.standby.dto;

import com.personalfinance.standby.entity.Standby;

import java.time.Instant;

public class StandbyResponse {

    private Long id;
    private String itemLabel;
    private Integer quantity;
    private Long expectedUnitPrice;
    /** Jalali string "YYYY/MM/DD". */
    private String dateAdded;
    private Long totalValue;
    private String notes;
    private Instant createdAt;

    public static StandbyResponse from(Standby standby, String dateAddedJalali) {
        StandbyResponse r = new StandbyResponse();
        r.id                = standby.getId();
        r.itemLabel         = standby.getItemLabel();
        r.quantity          = standby.getQuantity();
        r.expectedUnitPrice = standby.getExpectedUnitPrice();
        r.dateAdded         = dateAddedJalali;
        r.totalValue        = (long) standby.getQuantity() * standby.getExpectedUnitPrice();
        r.notes             = standby.getNotes();
        r.createdAt         = standby.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getItemLabel() { return itemLabel; }
    public Integer getQuantity() { return quantity; }
    public Long getExpectedUnitPrice() { return expectedUnitPrice; }
    public String getDateAdded() { return dateAdded; }
    public Long getTotalValue() { return totalValue; }
    public String getNotes() { return notes; }
    public Instant getCreatedAt() { return createdAt; }
}
