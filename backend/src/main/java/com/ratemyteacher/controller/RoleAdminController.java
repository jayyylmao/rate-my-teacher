package com.ratemyteacher.controller;

import com.ratemyteacher.auth.RoleEntity;
import com.ratemyteacher.auth.RoleRepository;
import com.ratemyteacher.auth.UserEntity;
import com.ratemyteacher.auth.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Admin endpoints for managing user roles.
 * Only accessible by users with ROLE_ADMIN.
 */
@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class RoleAdminController {

    private static final Set<String> ALLOWED_ROLES = Set.of("ROLE_ADMIN", "ROLE_MODERATOR");

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    /**
     * POST /api/admin/roles/set
     * Grant or revoke a role for a user.
     */
    @PostMapping("/set")
    public ResponseEntity<?> setRole(@Valid @RequestBody SetRoleRequest request) {
        log.info("POST /api/admin/roles/set - email: {}, role: {}, enabled: {}",
                request.getEmail(), request.getRole(), request.isEnabled());

        // Validate role name
        if (!ALLOWED_ROLES.contains(request.getRole())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid role. Allowed roles: " + ALLOWED_ROLES
            ));
        }

        // Find user
        UserEntity user = userRepository.findByEmail(request.getEmail().toLowerCase()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of(
                    "error", "User not found with email: " + request.getEmail()
            ));
        }

        // Find role
        RoleEntity role = roleRepository.findByName(request.getRole()).orElse(null);
        if (role == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Role not found: " + request.getRole()
            ));
        }

        // Add or remove role
        if (request.isEnabled()) {
            user.addRole(role);
            log.info("Granted {} to user {}", request.getRole(), user.getEmail());
        } else {
            user.removeRole(role);
            log.info("Revoked {} from user {}", request.getRole(), user.getEmail());
        }

        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", request.isEnabled()
                        ? "Role " + request.getRole() + " granted to " + user.getEmail()
                        : "Role " + request.getRole() + " revoked from " + user.getEmail(),
                "email", user.getEmail(),
                "roles", user.getRoles().stream().map(RoleEntity::getName).collect(Collectors.toList())
        ));
    }

    /**
     * GET /api/admin/roles/users
     * List all users with their roles.
     */
    @GetMapping("/users")
    public ResponseEntity<?> listUsersWithRoles() {
        log.info("GET /api/admin/roles/users");

        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(user -> Map.of(
                        "id", (Object) user.getId(),
                        "email", user.getEmail(),
                        "roles", user.getRoles().stream().map(RoleEntity::getName).collect(Collectors.toList())
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }

    @Data
    public static class SetRoleRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Role is required")
        @Pattern(regexp = "ROLE_(ADMIN|MODERATOR)", message = "Invalid role format")
        private String role;

        private boolean enabled;
    }
}
