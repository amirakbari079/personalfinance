package com.personalfinance.business.dto;

import com.personalfinance.business.entity.BizCounterparty;
import java.time.Instant;

public class BizCounterpartyResponse {

    private Long id;
    private String code;
    private String name;
    private String role;
    private String phone;
    private boolean isActive;
    private String notes;
    private Instant createdAt;

    public BizCounterpartyResponse() {}

    public static BizCounterpartyResponse fromEntity(BizCounterparty c) {
        if (c == null) return null;
        BizCounterpartyResponse r = new BizCounterpartyResponse();
        r.id = c.getId();
        r.code = c.getCode();
        r.name = c.getName();
        r.role = c.getRole();
        r.phone = c.getPhone();
        r.isActive = c.isActive();
        r.notes = c.getNotes();
        r.createdAt = c.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public String getRole() { return role; }
    public String getPhone() { return phone; }
    public boolean isActive() { return isActive; }
    public String getNotes() { return notes; }
    public Instant getCreatedAt() { return createdAt; }
}
