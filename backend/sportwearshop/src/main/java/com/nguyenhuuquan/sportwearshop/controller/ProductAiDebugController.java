package com.nguyenhuuquan.sportwearshop.controller;

import com.nguyenhuuquan.sportwearshop.dto.ai.ProductAiSearchDebugResponse;
import com.nguyenhuuquan.sportwearshop.service.ProductAiIndexService;
import com.nguyenhuuquan.sportwearshop.service.ProductAiSearchService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class ProductAiDebugController {

    private final ProductAiIndexService productAiIndexService;
    private final ProductAiSearchService productAiSearchService;

    public ProductAiDebugController(ProductAiIndexService productAiIndexService,
                                    ProductAiSearchService productAiSearchService) {
        this.productAiIndexService = productAiIndexService;
        this.productAiSearchService = productAiSearchService;
    }

    @PostMapping("/product-index/rebuild")
    public Map<String, Object> rebuildProductAiIndex() {
        int indexedCount = productAiIndexService.rebuildIndex();

        return Map.of(
                "indexedCount", indexedCount,
                "message", "Đã rebuild product_ai_documents"
        );
    }

    @GetMapping("/product-search/debug")
    public ProductAiSearchDebugResponse debugProductSearch(@RequestParam String message,
                                                           @RequestParam(defaultValue = "8") int limit) {
        return productAiSearchService.search(message, List.of(), Math.max(1, limit));
    }
}
