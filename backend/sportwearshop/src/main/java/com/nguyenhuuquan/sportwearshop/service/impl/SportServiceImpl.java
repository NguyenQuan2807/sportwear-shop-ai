package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.common.exception.BadRequestException;
import com.nguyenhuuquan.sportwearshop.common.exception.ResourceNotFoundException;
import com.nguyenhuuquan.sportwearshop.dto.sport.CreateSportRequest;
import com.nguyenhuuquan.sportwearshop.dto.sport.SportResponse;
import com.nguyenhuuquan.sportwearshop.dto.sport.UpdateSportRequest;
import com.nguyenhuuquan.sportwearshop.entity.Sport;
import com.nguyenhuuquan.sportwearshop.repository.ProductRepository;
import com.nguyenhuuquan.sportwearshop.repository.SportRepository;
import com.nguyenhuuquan.sportwearshop.service.FileStorageService;
import com.nguyenhuuquan.sportwearshop.service.SportService;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SportServiceImpl implements SportService {

    private final SportRepository sportRepository;
    private final ProductRepository productRepository;
    private final FileStorageService fileStorageService;

    public SportServiceImpl(
            SportRepository sportRepository,
            ProductRepository productRepository,
            FileStorageService fileStorageService
    ) {
        this.sportRepository = sportRepository;
        this.productRepository = productRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public List<SportResponse> getAllSports() {
        return sportRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .sorted(Comparator.comparing(SportResponse::getProductCount, Comparator.nullsLast(Long::compareTo)).reversed()
                        .thenComparing(SportResponse::getId))
                .collect(Collectors.toList());
    }

    @Override
    public SportResponse getSportById(Long id) {
        Sport sport = sportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn thể thao"));

        return mapToResponse(sport);
    }

    @Override
    public SportResponse createSport(CreateSportRequest request) {
        if (sportRepository.existsByName(request.getName())) {
            throw new BadRequestException("Tên môn thể thao đã tồn tại");
        }

        if (sportRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Slug đã tồn tại");
        }

        Sport sport = new Sport();
        sport.setName(request.getName());
        sport.setSlug(request.getSlug());
        sport.setDescription(request.getDescription());
        sport.setImageUrl(normalizeUrl(request.getImageUrl()));
        sport.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        return mapToResponse(sportRepository.save(sport));
    }

    @Override
    public SportResponse updateSport(Long id, UpdateSportRequest request) {
        Sport sport = sportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn thể thao"));

        if (sportRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new BadRequestException("Tên môn thể thao đã tồn tại");
        }

        if (sportRepository.existsBySlugAndIdNot(request.getSlug(), id)) {
            throw new BadRequestException("Slug đã tồn tại");
        }

        String oldImageUrl = sport.getImageUrl();

        sport.setName(request.getName());
        sport.setSlug(request.getSlug());
        sport.setDescription(request.getDescription());
        sport.setImageUrl(normalizeUrl(request.getImageUrl()));
        sport.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        Sport savedSport = sportRepository.save(sport);

        if (hasFileChanged(oldImageUrl, savedSport.getImageUrl())) {
            fileStorageService.deleteFile(oldImageUrl);
        }

        return mapToResponse(savedSport);
    }

    @Override
    public void deleteSport(Long id) {
        Sport sport = sportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn thể thao"));

        fileStorageService.deleteFile(sport.getImageUrl());
        sportRepository.delete(sport);
    }

    private String normalizeUrl(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean hasFileChanged(String oldUrl, String newUrl) {
        return oldUrl != null && !oldUrl.isBlank() && !oldUrl.equals(newUrl);
    }

    private SportResponse mapToResponse(Sport sport) {
        SportResponse response = new SportResponse();
        response.setId(sport.getId());
        response.setName(sport.getName());
        response.setSlug(sport.getSlug());
        response.setDescription(sport.getDescription());
        response.setImageUrl(sport.getImageUrl());
        response.setProductCount(productRepository.countBySportIdAndIsActiveTrue(sport.getId()));
        response.setIsActive(sport.getIsActive());
        return response;
    }
}
