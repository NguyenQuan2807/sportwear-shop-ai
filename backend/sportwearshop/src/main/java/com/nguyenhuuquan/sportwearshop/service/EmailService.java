package com.nguyenhuuquan.sportwearshop.service;

public interface EmailService {
    void sendEmail(String to, String subject, String content);
}
