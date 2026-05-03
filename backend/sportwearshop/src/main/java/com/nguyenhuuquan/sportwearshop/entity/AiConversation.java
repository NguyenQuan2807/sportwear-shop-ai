package com.nguyenhuuquan.sportwearshop.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "ai_conversations",
        indexes = {
                @Index(name = "idx_ai_conversation_session_id", columnList = "session_id"),
                @Index(name = "idx_ai_conversation_user_id", columnList = "user_id")
        }
)
@Getter
@Setter
public class AiConversation extends BaseEntity {

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "user_id")
    private Long userId;

    @Column(length = 30)
    private String status = "ACTIVE";
}
