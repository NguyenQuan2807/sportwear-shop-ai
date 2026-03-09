package com.nguyenhuuquan.sportwearshop.service;

import com.nguyenhuuquan.sportwearshop.dto.category.CategoryResponse;
import com.nguyenhuuquan.sportwearshop.dto.category.CreateCategoryRequest;
import com.nguyenhuuquan.sportwearshop.dto.category.UpdateCategoryRequest;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getAllCategories();
    CategoryResponse getCategoryById(Long id);
    CategoryResponse createCategory(CreateCategoryRequest request);
    CategoryResponse updateCategory(Long id, UpdateCategoryRequest request);
    void deleteCategory(Long id);
}