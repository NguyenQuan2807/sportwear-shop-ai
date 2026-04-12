package com.nguyenhuuquan.sportwearshop.repository;

import com.nguyenhuuquan.sportwearshop.dto.brand.TopBrandResponse;
import com.nguyenhuuquan.sportwearshop.entity.Brand;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    boolean existsByName(String name);
    boolean existsBySlug(String slug);

    @Query("""
        select new com.nguyenhuuquan.sportwearshop.dto.brand.TopBrandResponse(
            b.id,
            b.name,
            b.slug,
            b.description,
            b.logoUrl,
            count(p.id)
        )
        from Brand b
        left join Product p on p.brand.id = b.id and p.isActive = true
        where b.isActive = true
        group by b.id, b.name, b.slug, b.description, b.logoUrl
        order by count(p.id) desc, b.id asc
    """)
    List<TopBrandResponse> findTopBrandsForHome(Pageable pageable);
}