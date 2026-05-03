package com.nguyenhuuquan.sportwearshop.dto.ai;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AiChatRequest(
        Long conversationId,

        /*
         * sessionId không bắt buộc.
         * Nếu frontend chưa đăng nhập user, có thể tạo 1 UUID ở localStorage rồi gửi lên để backend
         * tìm lại conversation gần nhất của phiên chat đó.
         */
        String sessionId,

        @NotBlank(message = "Message is required")
        @Size(max = 1000, message = "Message must be less than 1000 characters")
        String message,

        /*
         * Giữ lại history để tương thích với frontend cũ.
         * Nếu conversationId có dữ liệu trong database, backend sẽ ưu tiên history từ database.
         */
        @Valid
        List<AiChatMessageDto> history
) {
}
