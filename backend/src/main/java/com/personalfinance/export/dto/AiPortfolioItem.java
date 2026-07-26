package com.personalfinance.export.dto;

public class AiPortfolioItem {

    private Long id;
    private String name;
    private Long amount;
    private String notes;
    private String type;
    private String typeLabelFa;
    private String category;
    private String categoryLabelFa;
    private String recordedDate;

    public AiPortfolioItem() {}

    public AiPortfolioItem(Long id, String name, Long amount, String notes,
                           String type, String typeLabelFa,
                           String category, String categoryLabelFa,
                           String recordedDate) {
        this.id = id;
        this.name = name;
        this.amount = amount;
        this.notes = notes;
        this.type = type;
        this.typeLabelFa = typeLabelFa;
        this.category = category;
        this.categoryLabelFa = categoryLabelFa;
        this.recordedDate = recordedDate;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public Long getAmount() { return amount; }
    public String getNotes() { return notes; }
    public String getType() { return type; }
    public String getTypeLabelFa() { return typeLabelFa; }
    public String getCategory() { return category; }
    public String getCategoryLabelFa() { return categoryLabelFa; }
    public String getRecordedDate() { return recordedDate; }
}
