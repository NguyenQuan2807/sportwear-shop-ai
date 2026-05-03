package com.nguyenhuuquan.sportwearshop.repository;

import com.nguyenhuuquan.sportwearshop.entity.AiSuggestedProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AiSuggestedProductRepository extends JpaRepository<AiSuggestedProduct, Long> {

    @Query("""
            select suggested
            from AiSuggestedProduct suggested
            where suggested.conversation.id = :conversationId
              and suggested.message.id = (
                    select max(lastSuggested.message.id)
                    from AiSuggestedProduct lastSuggested
                    where lastSuggested.conversation.id = :conversationId
              )
            order by suggested.rankOrder asc, suggested.id asc
            """)
    List<AiSuggestedProduct> findLatestSuggestedProducts(@Param("conversationId") Long conversationId);
}
