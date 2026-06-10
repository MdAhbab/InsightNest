package com.insightnest.faq;

import com.insightnest.exception.ApiException;
import com.insightnest.faq.dto.FaqRequest;
import com.insightnest.faq.dto.FaqResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/faqs")
public class FaqController {
    private final FaqRepository faqRepository;

    public FaqController(FaqRepository faqRepository) {
        this.faqRepository = faqRepository;
    }

    @GetMapping
    public List<FaqResponse> list() {
        List<Faq> faqs = isAdmin() ? faqRepository.findAll() : faqRepository.findByActiveTrueOrderByCreatedAtAsc();
        return faqs.stream().map(FaqResponse::from).toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public FaqResponse create(@Valid @RequestBody FaqRequest request) {
        Faq faq = new Faq();
        applyRequest(faq, request);
        return FaqResponse.from(faqRepository.save(faq));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public FaqResponse update(@PathVariable Long id, @Valid @RequestBody FaqRequest request) {
        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "FAQ not found"));
        applyRequest(faq, request);
        return FaqResponse.from(faqRepository.save(faq));
    }

    private void applyRequest(Faq faq, FaqRequest request) {
        faq.setQuestion(request.getQuestion());
        faq.setAnswer(request.getAnswer());
        faq.setActive(request.isActive());
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }
}
