package com.nguyenhuuquan.sportwearshop.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "ai_suggested_products",
        indexes = {
                @Index(name = "idx_ai_suggested_conversation_id", columnList = "conversation_id"),
                @Index(name = "idx_ai_suggested_message_id", columnList = "message_id"),
                @Index(name = "idx_ai_suggested_product_id", columnList = "product_id")
        }
)
@Getter
@Setter
public class AiSuggestedProduct extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id", nullable = false)
    private AiConversation conversation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "message_id", nullable = false)
    private AiMessage message;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "rank_order")
    private Integer rankOrder;

    @Column(columnDefinition = "TEXT")
    private String reason;
}
