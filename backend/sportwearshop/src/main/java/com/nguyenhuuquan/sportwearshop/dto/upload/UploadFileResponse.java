package com.nguyenhuuquan.sportwearshop.dto.upload;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UploadFileResponse {
    private String url;
    private String path;
    private String fileName;
}