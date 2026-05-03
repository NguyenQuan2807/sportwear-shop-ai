package com.nguyenhuuquan.sportwearshop.dto.admin.ai;

import java.util.List;

public record AdminAiDashboardInsightResponse(
        String overview,
        List<String> highlights,
        List<String> warnings,
        List<String> recommendations,
        List<AdminAiPriorityActionResponse> priorityActions,
        String source
) {
}
