package com.insightnest.resource;

import com.insightnest.resource.dto.ResourceResponse;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.net.URLEncoder;

@RestController
@RequestMapping("/api/v1/resources")
public class LibraryResourceController {
    private final LibraryResourceService resourceService;

    public LibraryResourceController(LibraryResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public Page<ResourceResponse> list(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return resourceService.list(pageable).map(ResourceResponse::from);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('LEARNER','FACULTY')")
    public ResourceResponse upload(@RequestParam String title,
                                   @RequestParam(required = false) String description,
                                   @RequestParam(defaultValue = "true") boolean publicAccess,
                                   @RequestParam MultipartFile file) {
        return ResourceResponse.from(resourceService.upload(title, description, publicAccess, file));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        LibraryResource resource = resourceService.getDownloadable(id);
        Resource file = resourceService.loadFile(resource);
        String encodedName = URLEncoder.encode(resource.getFileName(), StandardCharsets.UTF_8).replace("+", "%20");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename*=UTF-8''" + encodedName)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(file);
    }
}
