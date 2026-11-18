package com.personalfinance.business.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class BizCounterpartyRequest {

    @NotBlank(message = "کد طرف حساب الزامی است")
    @Size(max = 50, message = "کد طرف حساب حداکثر ۵۰ کاراکتر است")
    private String code;

    @NotBlank(message = "نام طرف حساب الزامی است")
    @Size(max = 150, message = "نام طرف حساب حداکثر ۱۵۰ کاراکتر است")
    private String name;

    @NotBlank(message = "نقش طرف حساب الزامی است")
    @Pattern(regexp = "^(CUSTOMER|SUPPLIER|BOTH)$", message = "نقش باید مشتری (CUSTOMER)، تأمین‌کننده (SUPPLIER) یا هردو (BOTH) باشد")
    private String role;

    @Size(max = 30, message = "شماره تلفن حداکثر ۳۰ کاراکتر است")
    private String phone;

    private Boolean isActive = true;

    private String notes;

    public BizCounterpartyRequest() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Boolean getIsActive() { return isActive != null ? isActive : true; }
    public void setIsActive(Boolean active) { isActive = active; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
