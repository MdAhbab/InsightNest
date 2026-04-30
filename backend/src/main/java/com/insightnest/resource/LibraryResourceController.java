package com.insightnest.resource;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class LibraryResourceController {
    private final LibraryResourceService resourceService;

    public LibraryResourceController(LibraryResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public List<LibraryResource> list() {
        return resourceService.list();
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('LEARNER','FACULTY')")
    public LibraryResource upload(@RequestParam String title,
                                  @RequestParam(required = false) String description,
                                  @RequestParam(defaultValue = "true") boolean publicAccess,
                                  @RequestParam MultipartFile file) {
        return resourceService.upload(title, description, publicAccess, file);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Resource file = resourceService.download(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=resource")
                .body(file);
    }
}
