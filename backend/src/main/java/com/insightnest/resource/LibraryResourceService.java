package com.insightnest.resource;

import com.insightnest.config.StorageProperties;
import com.insightnest.exception.ApiException;
import com.insightnest.user.User;
import com.insightnest.user.UserService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class LibraryResourceService {
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "doc", "docx", "ppt", "pptx");
    private static final long MAX_FILE_SIZE_BYTES = 20L * 1024 * 1024;

    private final LibraryResourceRepository resourceRepository;
    private final UserService userService;
    private final StorageProperties storageProperties;

    public LibraryResourceService(LibraryResourceRepository resourceRepository,
                                  UserService userService,
                                  StorageProperties storageProperties) {
        this.resourceRepository = resourceRepository;
        this.userService = userService;
        this.storageProperties = storageProperties;
    }

    public Page<LibraryResource> list(Pageable pageable) {
        return resourceRepository.findAll(pageable);
    }

    public LibraryResource upload(String title, String description, boolean publicAccess, MultipartFile file) {
        User user = userService.getCurrentUser();
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File is required");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "Uploaded file exceeds the 20 MB limit");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "resource" : file.getOriginalFilename());
        String extension = StringUtils.getFilenameExtension(originalName);
        if (extension == null || !ALLOWED_EXTENSIONS.contains(extension.toLowerCase(Locale.ROOT))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Allowed file types: PDF, DOC, DOCX, PPT, PPTX");
        }

        String storedName = UUID.randomUUID() + "-" + originalName;
        Path storageRoot = Paths.get(storageProperties.getPath()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(storageRoot);
            Path destination = storageRoot.resolve(storedName).normalize();
            if (!destination.startsWith(storageRoot)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid file name");
            }
            file.transferTo(destination);

            LibraryResource resource = new LibraryResource();
            resource.setTitle(title);
            resource.setDescription(description);
            resource.setFileName(originalName);
            resource.setFilePath(destination.toString());
            resource.setFileSize(file.getSize());
            resource.setPublicAccess(publicAccess);
            resource.setUploader(user);
            return resourceRepository.save(resource);
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "File upload failed");
        }
    }

    public LibraryResource getDownloadable(Long id) {
        LibraryResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Resource not found"));
        if (!resource.isPublicAccess() && !isAuthenticated()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Login required to download this resource");
        }
        return resource;
    }

    public Resource loadFile(LibraryResource resource) {
        try {
            Path path = Paths.get(resource.getFilePath());
            Resource file = new UrlResource(path.toUri());
            if (!file.exists()) {
                throw new ApiException(HttpStatus.NOT_FOUND, "File not found");
            }
            return file;
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.NOT_FOUND, "File not found");
        }
    }

    private boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getPrincipal() instanceof User;
    }
}
