package com.personalfinance.standby.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "standby")
public class Standby extends BaseEntity {

    @Column(name = "item_label", nullable = false, length = 100)
    private String itemLabel;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "expected_unit_price", nullable = false)
    private Long expectedUnitPrice;

    @Column(name = "date_added")
    private LocalDate dateAdded;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public Standby() {}

    public String getItemLabel() { return itemLabel; }
    public void setItemLabel(String itemLabel) { this.itemLabel = itemLabel; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Long getExpectedUnitPrice() { return expectedUnitPrice; }
    public void setExpectedUnitPrice(Long expectedUnitPrice) { this.expectedUnitPrice = expectedUnitPrice; }

    public LocalDate getDateAdded() { return dateAdded; }
    public void setDateAdded(LocalDate dateAdded) { this.dateAdded = dateAdded; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
