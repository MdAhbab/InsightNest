package com.insightnest.saved;

import com.insightnest.saved.dto.SavedItemRequest;
import com.insightnest.saved.dto.SavedItemResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/saved-items")
public class SavedItemController {
    private final SavedItemService savedItemService;

    public SavedItemController(SavedItemService savedItemService) {
        this.savedItemService = savedItemService;
    }

    @GetMapping
    public List<SavedItemResponse> list() {
        return savedItemService.listMine().stream().map(SavedItemResponse::from).toList();
    }

    @PostMapping
    public SavedItemResponse create(@Valid @RequestBody SavedItemRequest request) {
        return SavedItemResponse.from(savedItemService.save(request));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        savedItemService.delete(id);
    }
}
