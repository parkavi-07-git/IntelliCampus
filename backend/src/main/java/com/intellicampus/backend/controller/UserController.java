package com.intellicampus.backend.controller;

import com.intellicampus.backend.entity.User;
import com.intellicampus.backend.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private boolean isAdmin(HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        return session != null
                && session.getAttribute("userId") != null
                && "ADMIN".equalsIgnoreCase(
                        String.valueOf(session.getAttribute("role")));
    }

    @PostMapping
    public ResponseEntity<?> createUser(
            @RequestBody User user,
            HttpServletRequest request) {

        if (!isAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "message", "Only an admin can create accounts."
            ));
        }

        if (user.getName() == null || user.getName().isBlank()
                || user.getEmail() == null || user.getEmail().isBlank()
                || user.getPassword() == null
                || user.getPassword().length() < 8
                || user.getRole() == null || user.getRole().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message",
                    "Name, email, role and a password of at least 8 characters are required."
            ));
        }

        String email = user.getEmail().trim().toLowerCase(Locale.ROOT);
        String role = user.getRole().trim().toUpperCase(Locale.ROOT);

        if (!List.of("STUDENT", "TEACHER", "ADMIN").contains(role)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid role."
            ));
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "success", false,
                    "message", "An account with this email already exists."
            ));
        }

        user.setEmail(email);
        user.setRole(role);
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // New teacher accounts must be approved separately.
        user.setApproved(!"TEACHER".equals(role));

        // Do not claim an email has been verified automatically.
        user.setEmailVerified(false);

        User saved = userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Account created. Email verification is still required.",
                "id", saved.getId(),
                "name", saved.getName(),
                "email", saved.getEmail(),
                "role", saved.getRole(),
                "approved", Boolean.TRUE.equals(saved.getApproved()),
                "emailVerified", Boolean.TRUE.equals(saved.getEmailVerified())
        ));
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(HttpServletRequest request) {

        if (!isAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "message", "Only an admin can view accounts."
            ));
        }

        List<Map<String, Object>> users = userRepository.findAll()
                .stream()
                .map(user -> Map.<String, Object>of(
                        "id", user.getId(),
                        "name", user.getName() == null ? "" : user.getName(),
                        "email", user.getEmail() == null ? "" : user.getEmail(),
                        "role", user.getRole() == null ? "" : user.getRole(),
                        "approved", Boolean.TRUE.equals(user.getApproved()),
                        "emailVerified", Boolean.TRUE.equals(user.getEmailVerified())
                ))
                .toList();

        return ResponseEntity.ok(users);
    }
}
