package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.dto.sport.CreateSportRequest;
import com.nguyenhuuquan.sportwearshop.dto.sport.SportResponse;
import com.nguyenhuuquan.sportwearshop.dto.sport.UpdateSportRequest;
import com.nguyenhuuquan.sportwearshop.entity.Sport;
import com.nguyenhuuquan.sportwearshop.repository.SportRepository;
import com.nguyenhuuquan.sportwearshop.service.SportService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SportServiceImpl implements SportService {

    private final SportRepository sportRepository;

    public SportServiceImpl(SportRepository sportRepository) {
        this.sportRepository = sportRepository;
    }

    @Override
    public List<SportResponse> getAllSports() {
        return sportRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SportResponse getSportById(Long id) {
        Sport sport = sportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy môn thể thao"));

        return mapToResponse(sport);
    }

    @Override
    public SportResponse createSport(CreateSportRequest request) {
        if (sportRepository.existsByName(request.getName())) {
            throw new RuntimeException("Tên môn thể thao đã tồn tại");
        }
        if (sportRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Slug đã tồn tại");
        }

        Sport sport = new Sport();
        sport.setName(request.getName());
        sport.setSlug(request.getSlug());
        sport.setDescription(request.getDescription());
        sport.setIconUrl(request.getIconUrl());
        sport.setIsActive(true);

        return mapToResponse(sportRepository.save(sport));
    }

    @Override
    public SportResponse updateSport(Long id, UpdateSportRequest request) {
        Sport sport = sportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy môn thể thao"));

        sport.setName(request.getName());
        sport.setSlug(request.getSlug());
        sport.setDescription(request.getDescription());
        sport.setIconUrl(request.getIconUrl());
        sport.setIsActive(request.getIsActive());

        return mapToResponse(sportRepository.save(sport));
    }

    @Override
    public void deleteSport(Long id) {
        Sport sport = sportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy môn thể thao"));

        sportRepository.delete(sport);
    }

    private SportResponse mapToResponse(Sport sport) {
        SportResponse response = new SportResponse();
        response.setId(sport.getId());
        response.setName(sport.getName());
        response.setSlug(sport.getSlug());
        response.setDescription(sport.getDescription());
        response.setIconUrl(sport.getIconUrl());
        response.setIsActive(sport.getIsActive());
        return response;
    }
}