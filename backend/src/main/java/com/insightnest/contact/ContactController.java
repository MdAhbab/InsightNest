package com.insightnest.contact;

import com.insightnest.contact.dto.ContactRequestDto;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact")
public class ContactController {
    private final ContactRepository contactRepository;

    public ContactController(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    @PostMapping
    public ContactRequest create(@RequestBody ContactRequestDto request) {
        ContactRequest contact = new ContactRequest();
        contact.setName(request.getName());
        contact.setEmail(request.getEmail());
        contact.setSubject(request.getSubject());
        contact.setMessage(request.getMessage());
        return contactRepository.save(contact);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<ContactRequest> list() {
        return contactRepository.findAll();
    }
}
