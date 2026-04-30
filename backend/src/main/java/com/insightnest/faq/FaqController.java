package com.insightnest.faq;

import com.insightnest.exception.ApiException;
import com.insightnest.faq.dto.FaqRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faqs")
public class FaqController {
    private final FaqRepository faqRepository;

    public FaqController(FaqRepository faqRepository) {
        this.faqRepository = faqRepository;
    }

    @GetMapping
    public List<Faq> list() {
        return faqRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Faq create(@RequestBody FaqRequest request) {
        Faq faq = new Faq();
        applyRequest(faq, request);
        return faqRepository.save(faq);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Faq update(@PathVariable Long id, @RequestBody FaqRequest request) {
        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "FAQ not found"));
        applyRequest(faq, request);
        return faqRepository.save(faq);
    }

    private void applyRequest(Faq faq, FaqRequest request) {
        faq.setQuestion(request.getQuestion());
        faq.setAnswer(request.getAnswer());
        faq.setActive(request.isActive());
    }
}
