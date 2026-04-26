package com.nguyenhuuquan.sportwearshop.dto.ai;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiChatMessage {

    @Size(max = 20)
    private String role;

    @Size(max = 2000)
    private String content;
}
