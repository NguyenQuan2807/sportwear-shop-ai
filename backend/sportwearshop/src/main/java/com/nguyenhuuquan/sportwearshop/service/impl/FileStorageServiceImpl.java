package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.common.exception.BadRequestException;
import com.nguyenhuuquan.sportwearshop.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg"
    );

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Override
    public String storeImage(MultipartFile file, String folder) {
        validateFile(file);

        try {
            String normalizedFolder = normalizeFolder(folder);
            Path basePath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path folderPath = basePath.resolve(normalizedFolder).normalize();

            if (!folderPath.startsWith(basePath)) {
                throw new BadRequestException("Thư mục upload không hợp lệ");
            }

            Files.createDirectories(folderPath);

            String extension = getExtension(file.getOriginalFilename());
            String fileName = UUID.randomUUID() + extension;
            Path targetFile = folderPath.resolve(fileName).normalize();

            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + normalizedFolder + "/" + fileName;
        } catch (IOException e) {
            throw new BadRequestException("Không thể lưu file ảnh");
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }

        try {
            String relativeUploadPath = extractRelativeUploadPath(fileUrl);
            if (relativeUploadPath == null || relativeUploadPath.isBlank()) {
                return;
            }

            Path basePath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path targetFile = basePath.resolve(relativeUploadPath).normalize();

            if (!targetFile.startsWith(basePath)) {
                return;
            }

            Files.deleteIfExists(targetFile);
        } catch (IOException ignored) {
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File ảnh không được để trống");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Ảnh vượt quá dung lượng cho phép 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new BadRequestException("Chỉ hỗ trợ ảnh JPG, PNG, WEBP");
        }

        String extension = getExtension(file.getOriginalFilename()).toLowerCase(Locale.ROOT);
        if (!Set.of(".jpg", ".jpeg", ".png", ".webp").contains(extension)) {
            throw new BadRequestException("Định dạng file ảnh không hợp lệ");
        }
    }

    private String normalizeFolder(String folder) {
        if (folder == null || folder.isBlank()) {
            return "misc";
        }

        String normalized = folder.replace("\\", "/");
        normalized = normalized.replaceAll("^/+", "").replaceAll("/+$", "");

        if (normalized.isBlank()) {
            return "misc";
        }

        return normalized;
    }

    private String getExtension(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) {
            return ".jpg";
        }
        return originalFilename.substring(originalFilename.lastIndexOf("."));
    }

    private String extractRelativeUploadPath(String fileUrl) {
        String cleaned = fileUrl.trim();

        int queryIndex = cleaned.indexOf('?');
        if (queryIndex >= 0) {
            cleaned = cleaned.substring(0, queryIndex);
        }

        int uploadsIndex = cleaned.indexOf("/uploads/");
        if (uploadsIndex >= 0) {
            return cleaned.substring(uploadsIndex + "/uploads/".length());
        }

        if (cleaned.startsWith("uploads/")) {
            return cleaned.substring("uploads/".length());
        }

        return null;
    }
}