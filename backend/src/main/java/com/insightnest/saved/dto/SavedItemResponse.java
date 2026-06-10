package com.insightnest.saved.dto;

import com.insightnest.saved.SavedItem;
import com.insightnest.saved.SavedItemType;

import java.time.Instant;

public record SavedItemResponse(Long id, SavedItemType itemType, Long itemId, Instant createdAt) {
    public static SavedItemResponse from(SavedItem item) {
        if (item == null) {
            return null;
        }
        return new SavedItemResponse(item.getId(), item.getItemType(), item.getItemId(), item.getCreatedAt());
    }
}
