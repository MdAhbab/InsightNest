package com.insightnest.admin;

import com.insightnest.admin.dto.AdminBootstrapRequest;
import com.insightnest.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminBootstrapController {
    private final AdminBootstrapService adminBootstrapService;

    public AdminBootstrapController(AdminBootstrapService adminBootstrapService) {
        this.adminBootstrapService = adminBootstrapService;
    }

    @PostMapping("/bootstrap")
    public UserResponse bootstrap(@Valid @RequestBody AdminBootstrapRequest request) {
        return adminBootstrapService.bootstrap(request);
    }
}
