package com.nguyenhuuquan.sportwearshop.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String storeImage(MultipartFile file, String folder);
    void deleteFile(String fileUrl);
}