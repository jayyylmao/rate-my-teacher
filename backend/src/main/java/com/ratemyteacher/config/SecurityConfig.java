package com.ratemyteacher.config;

import com.ratemyteacher.auth.SessionAuthFilter;
import com.ratemyteacher.auth.SessionService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security configuration for session-based authentication.
 * Uses a custom filter to read the 'sid' cookie and authenticate users.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, SessionService sessionService) throws Exception {
        http
                // Disable CSRF (we're using cookies with SameSite=Lax)
                .csrf(csrf -> csrf.disable())

                // Enable CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Stateless session management (we manage sessions ourselves)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Add our custom session auth filter before AnonymousAuthenticationFilter
                .addFilterBefore(
                        new SessionAuthFilter(sessionService),
                        AnonymousAuthenticationFilter.class
                )

                // Authorization rules
                .authorizeHttpRequests(auth -> auth
                        // GraphQL endpoint is public (auth enforced in resolvers)
                        .requestMatchers("/graphql").permitAll()

                        // Auth endpoints are always public
                        .requestMatchers("/api/auth/**").permitAll()

                        // User-specific endpoints require authentication
                        .requestMatchers("/api/me").authenticated()
                        .requestMatchers("/api/my/**").authenticated()

                        // Admin role management requires ADMIN only
                        .requestMatchers("/api/admin/roles/**").hasRole("ADMIN")

                        // Other admin endpoints require ADMIN or MODERATOR
                        .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "MODERATOR")

                        // Health check is public
                        .requestMatchers("/api/health").permitAll()

                        // All other API endpoints are public (guest posting allowed)
                        .requestMatchers("/api/**").permitAll()

                        // Actuator endpoints
                        .requestMatchers("/actuator/**").permitAll()

                        // Everything else
                        .anyRequest().permitAll()
                )

                // Disable form login and http basic (we use cookie-based auth)
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable());

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "https://hello-world-five-peach.vercel.app",
                "https://hello-world-1b64tbn5r-jays-projects-b4affa61.vercel.app",
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:8080"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        source.registerCorsConfiguration("/graphql", configuration);
        return source;
    }
}
