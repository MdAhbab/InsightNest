package com.insightnest.saved;

import com.insightnest.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedItemRepository extends JpaRepository<SavedItem, Long> {
    List<SavedItem> findByUserOrderByCreatedAtDesc(User user);
    boolean existsByUserAndItemTypeAndItemId(User user, SavedItemType itemType, Long itemId);
    Optional<SavedItem> findByIdAndUser(Long id, User user);
}
