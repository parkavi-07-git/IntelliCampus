package com.intellicampus.backend.controller;

import com.intellicampus.backend.entity.User;
import com.intellicampus.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
    origins = "http://localhost:5173",
    allowCredentials = "true"
)
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // STUDENT LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> loginData) {

        String email = loginData.get("email");
        String password = loginData.get("password");

        if (email == null || email.isBlank()
                || password == null || password.isEmpty()) {
            return error(
                HttpStatus.BAD_REQUEST,
                "Email and password are required"
            );
        }

        Optional<User> userOptional =
                userRepository.findByEmail(email.trim().toLowerCase(Locale.ROOT));

        if (userOptional.isEmpty()) {
            return error(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password"
            );
        }

        User user = userOptional.get();

        if (!passwordMatches(password, user.getPassword())) {
            return error(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password"
            );
        }

        if (user.getRole() == null
                || !user.getRole().equalsIgnoreCase("STUDENT")) {
            return error(
                HttpStatus.FORBIDDEN,
                "Please use the correct login portal"
            );
        }

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            return error(
                HttpStatus.FORBIDDEN,
                "Please verify your email before logging in"
            );
        }

        if (!Boolean.TRUE.equals(user.getApproved())) {
            return error(
                HttpStatus.FORBIDDEN,
                "Your account has not been approved yet"
            );
        }

        return successResponse(user, "Student login successful");
    }

    // TEACHER AND ADMIN LOGIN
    @PostMapping("/teacher-login")
    public ResponseEntity<?> teacherLogin(
            @RequestBody Map<String, String> loginData) {

        String username = loginData.get("username");
        String password = loginData.get("password");

        if (username == null || username.isBlank()
                || password == null || password.isEmpty()) {
            return error(
                HttpStatus.BAD_REQUEST,
                "Username and password are required"
            );
        }

        Optional<User> userOptional =
                userRepository.findByName(username.trim());

        if (userOptional.isEmpty()) {
            return error(
                HttpStatus.UNAUTHORIZED,
                "Invalid teacher username or password"
            );
        }

        User user = userOptional.get();

        if (!passwordMatches(password, user.getPassword())) {
            return error(
                HttpStatus.UNAUTHORIZED,
                "Invalid teacher username or password"
            );
        }

        String role = user.getRole();

        if (role == null
                || (!role.equalsIgnoreCase("TEACHER")
                && !role.equalsIgnoreCase("ADMIN"))) {
            return error(
                HttpStatus.FORBIDDEN,
                "You do not have teacher/admin access"
            );
        }

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            return error(
                HttpStatus.FORBIDDEN,
                "Please verify your email before logging in"
            );
        }

        if (!Boolean.TRUE.equals(user.getApproved())) {
            return error(
                HttpStatus.FORBIDDEN,
                "Your account has not been approved yet"
            );
        }

        return successResponse(user, "Login successful");
    }

    // Supports BCrypt hashes and reports legacy plaintext passwords
    // as unmatched. Never return or log the stored password.
    private boolean passwordMatches(
            String rawPassword, String storedPassword) {

        if (storedPassword == null || storedPassword.isBlank()) {
            return false;
        }

        try {
            return passwordEncoder.matches(rawPassword, storedPassword);
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    private ResponseEntity<Map<String, Object>> successResponse(
            User user, String message) {

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Map<String, Object>> error(
            HttpStatus status, String message) {

        return ResponseEntity.status(status).body(Map.of(
            "success", false,
            "message", message
        ));
    }
}