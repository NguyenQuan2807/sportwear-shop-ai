package com.nguyenhuuquan.sportwearshop.service;

import com.nguyenhuuquan.sportwearshop.dto.sport.CreateSportRequest;
import com.nguyenhuuquan.sportwearshop.dto.sport.SportResponse;
import com.nguyenhuuquan.sportwearshop.dto.sport.UpdateSportRequest;

import java.util.List;

public interface SportService {
    List<SportResponse> getAllSports();
    SportResponse getSportById(Long id);
    SportResponse createSport(CreateSportRequest request);
    SportResponse updateSport(Long id, UpdateSportRequest request);
    void deleteSport(Long id);
}
