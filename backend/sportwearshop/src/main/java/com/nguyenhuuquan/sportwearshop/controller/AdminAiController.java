package com.nguyenhuuquan.sportwearshop.controller;

import com.nguyenhuuquan.sportwearshop.dto.admin.ai.AdminAiDashboardInsightResponse;
import com.nguyenhuuquan.sportwearshop.dto.admin.ai.AdminAiPromotionSuggestionsResponse;
import com.nguyenhuuquan.sportwearshop.service.AdminAiService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/ai")
@CrossOrigin(origins = "*")
public class AdminAiController {

    private final AdminAiService adminAiService;

    public AdminAiController(AdminAiService adminAiService) {
        this.adminAiService = adminAiService;
    }

    @GetMapping("/dashboard-insight")
    public AdminAiDashboardInsightResponse getDashboardInsight(
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) Integer year
    ) {
        return adminAiService.getDashboardInsight(period, date, month, year);
    }

    @GetMapping("/promotion-suggestions")
    public AdminAiPromotionSuggestionsResponse getPromotionSuggestions() {
        return adminAiService.getPromotionSuggestions();
    }
}
