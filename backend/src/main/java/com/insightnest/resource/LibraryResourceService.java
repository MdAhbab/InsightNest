package com.insightnest.resource;

import com.insightnest.config.StorageProperties;
import com.insightnest.exception.ApiException;
import com.insightnest.user.User;
import com.insightnest.user.UserService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class LibraryResourceService {
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

    public List<LibraryResource> list() {
        return resourceRepository.findAll();
    }

    public LibraryResource upload(String title, String description, boolean publicAccess, MultipartFile file) {
        User user = userService.getCurrentUser();
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File is required");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "resource" : file.getOriginalFilename());
        String storedName = UUID.randomUUID() + "-" + originalName;
        Path storageRoot = Paths.get(storageProperties.getPath()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(storageRoot);
            Path destination = storageRoot.resolve(storedName);
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

    public Resource download(Long id) {
        LibraryResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Resource not found"));
        try {
            Path path = Paths.get(resource.getFilePath());
            Resource file = new UrlResource(path.toUri());
            if (!file.exists()) {
                throw new ApiException(HttpStatus.NOT_FOUND, "File not found");
            }
            return file;
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.NOT_FOUND, "File not found");
        }
    }
}
