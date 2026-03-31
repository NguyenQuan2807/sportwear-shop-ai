package com.nguyenhuuquan.sportwearshop.controller;

import com.nguyenhuuquan.sportwearshop.common.exception.BadRequestException;
import com.nguyenhuuquan.sportwearshop.dto.upload.UploadFileResponse;
import com.nguyenhuuquan.sportwearshop.service.FileStorageService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.Set;

@RestController
@RequestMapping("/api/admin/uploads")
public class AdminUploadController {

    private static final Set<String> ALLOWED_FOLDERS = Set.of(
            "brands",
            "sports",
            "promotions",
            "products/thumbnails",
            "products/gallery"
    );

    private final FileStorageService fileStorageService;

    public AdminUploadController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadFileResponse uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("folder") String folder
    ) {
        if (!ALLOWED_FOLDERS.contains(folder)) {
            throw new BadRequestException("Folder upload không hợp lệ");
        }

        String relativePath = fileStorageService.storeImage(file, folder);
        String absoluteUrl = ServletUriComponentsBuilder
                .fromCurrentContextPath()
                .path(relativePath)
                .toUriString();

        return new UploadFileResponse(absoluteUrl, relativePath, file.getOriginalFilename());
    }
}