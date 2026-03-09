package com.nguyenhuuquan.sportwearshop.controller;

import com.nguyenhuuquan.sportwearshop.dto.sport.SportResponse;
import com.nguyenhuuquan.sportwearshop.service.SportService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sports")
@CrossOrigin(origins = "*")
public class SportController {

    private final SportService sportService;

    public SportController(SportService sportService) {
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
}