package com.insightnest.user.dto;

import com.insightnest.user.Role;
import com.insightnest.user.User;

import java.util.Set;

public record UserSummary(Long id, String fullName, Set<Role> roles) {
    public static UserSummary from(User user) {
        if (user == null) {
            return null;
        }
        return new UserSummary(user.getId(), user.getFullName(), user.getRoles());
    }
}
