package com.nguyenhuuquan.sportwearshop.service;

import com.nguyenhuuquan.sportwearshop.dto.admin.ai.AdminAiDashboardInsightResponse;
import com.nguyenhuuquan.sportwearshop.dto.admin.ai.AdminAiPromotionSuggestionsResponse;

public interface AdminAiService {
    AdminAiDashboardInsightResponse getDashboardInsight(String period, String date, String month, Integer year);

    AdminAiPromotionSuggestionsResponse getPromotionSuggestions();
}
