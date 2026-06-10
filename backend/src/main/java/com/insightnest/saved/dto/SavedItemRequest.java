package com.insightnest.saved.dto;

import com.insightnest.saved.SavedItemType;
import jakarta.validation.constraints.NotNull;

public class SavedItemRequest {
    @NotNull
    private SavedItemType itemType;

    @NotNull
    private Long itemId;

    public SavedItemType getItemType() {
        return itemType;
    }

    public void setItemType(SavedItemType itemType) {
        this.itemType = itemType;
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }
}
