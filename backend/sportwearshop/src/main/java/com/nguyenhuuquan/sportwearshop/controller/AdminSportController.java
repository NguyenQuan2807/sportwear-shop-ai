package com.nguyenhuuquan.sportwearshop.controller;

import com.nguyenhuuquan.sportwearshop.dto.sport.CreateSportRequest;
import com.nguyenhuuquan.sportwearshop.dto.sport.SportResponse;
import com.nguyenhuuquan.sportwearshop.dto.sport.UpdateSportRequest;
import com.nguyenhuuquan.sportwearshop.service.SportService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/sports")
@CrossOrigin(origins = "*")
public class AdminSportController {

    private final SportService sportService;

    public AdminSportController(SportService sportService) {
        this.sportService = sportService;
    }

    @GetMapping
    public List<SportResponse> getAllSports() {
        return sportService.getAllSports();
    }

    @GetMapping("/{id}")
    public SportResponse getSportById(@PathVariable Long id) {
        return sportService.getSportById(id);
    }

    @PostMapping
    public SportResponse createSport(@Valid @RequestBody CreateSportRequest request) {
        return sportService.createSport(request);
    }

    @PutMapping("/{id}")
    public SportResponse updateSport(@PathVariable Long id, @Valid @RequestBody UpdateSportRequest request) {
        return sportService.updateSport(id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteSport(@PathVariable Long id) {
        sportService.deleteSport(id);
        return "Xóa môn thể thao thành công";
    }
}
