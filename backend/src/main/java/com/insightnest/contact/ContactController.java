package com.insightnest.contact;

import com.insightnest.contact.dto.ContactRequestDto;
import com.insightnest.contact.dto.ContactResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/contact")
public class ContactController {
    private final ContactRepository contactRepository;

    public ContactController(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    @PostMapping
    public ContactResponse create(@Valid @RequestBody ContactRequestDto request) {
        ContactRequest contact = new ContactRequest();
        contact.setName(request.getName());
        contact.setEmail(request.getEmail());
        contact.setSubject(request.getSubject());
        contact.setMessage(request.getMessage());
        return ContactResponse.from(contactRepository.save(contact));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<ContactResponse> list(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return contactRepository.findAll(pageable).map(ContactResponse::from);
    }
}
