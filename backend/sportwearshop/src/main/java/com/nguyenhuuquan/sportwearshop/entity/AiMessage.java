package com.nguyenhuuquan.sportwearshop.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "ai_messages",
        indexes = {
                @Index(name = "idx_ai_message_conversation_id", columnList = "conversation_id"),
                @Index(name = "idx_ai_message_role", columnList = "role")
        }
)
@Getter
@Setter
public class AiMessage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id", nullable = false)
    private AiConversation conversation;

    @Column(nullable = false, length = 30)
    private String role;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
}
