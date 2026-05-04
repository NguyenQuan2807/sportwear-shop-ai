package com.nguyenhuuquan.sportwearshop.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET,
                                "/api/auth/check-email",
                                "/api/products/**",
                                "/api/sports/**",
                                "/api/categories/**",
                                "/api/brands/**",
                                "/api/promotions/**",
                                "/api/reviews/product/**",
                                "/uploads/**").permitAll()
                        .requestMatchers(HttpMethod.POST,
                                "/api/auth/login",
                                "/api/auth/register/request-code",
                                "/api/auth/register/complete",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password",
                                "/api/auth/refresh",
                                "/api/ai/chat",
                                "/api/payments/qr/webhook/sepay").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ADMIN + SALES_STAFF: các quyền vận hành bán hàng.
                        // Đặt các matcher này trước /api/admin/** để không bị rule ADMIN-only chặn.
                        .requestMatchers(HttpMethod.GET,
                                "/api/admin/dashboard",
                                "/api/admin/ai/dashboard-insight",
                                "/api/admin/orders/**",
                                "/api/admin/products/**",
                                "/api/admin/categories/**",
                                "/api/admin/brands/**",
                                "/api/admin/sports/**",
                                "/api/admin/promotions/**").hasAnyRole("ADMIN", "SALES_STAFF")
                        .requestMatchers(HttpMethod.PUT,
                                "/api/admin/orders/**").hasAnyRole("ADMIN", "SALES_STAFF")
                        .requestMatchers(HttpMethod.POST,
                                "/api/admin/products",
                                "/api/admin/uploads/images").hasAnyRole("ADMIN", "SALES_STAFF")
                        .requestMatchers(HttpMethod.PUT,
                                "/api/admin/products/**").hasAnyRole("ADMIN", "SALES_STAFF")

                        // ADMIN-only: quản lý user, role, danh mục, brand, sport, khuyến mãi, xóa dữ liệu.
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://127.0.0.1:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
