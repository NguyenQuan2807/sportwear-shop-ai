package com.nguyenhuuquan.sportwearshop.repository;

import com.nguyenhuuquan.sportwearshop.entity.AiMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AiMessageRepository extends JpaRepository<AiMessage, Long> {

    @Query("""
            select message
            from AiMessage message
            where message.conversation.id = :conversationId
            order by message.createdAt desc, message.id desc
            """)
    List<AiMessage> findRecentMessages(@Param("conversationId") Long conversationId, Pageable pageable);
}
