package com.intellicampus.backend.controller;

import com.intellicampus.backend.entity.User;
import com.intellicampus.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private void createLoginSession(
            HttpServletRequest request, User user) {

        HttpSession oldSession = request.getSession(false);

        if (oldSession != null) {
            oldSession.invalidate();
        }

        HttpSession session = request.getSession(true);
        session.setAttribute("userId", user.getId());
        session.setAttribute("email", user.getEmail());
        session.setAttribute("name", user.getName());
        session.setAttribute("role", user.getRole());
    }

    private Map<String, Object> userResponse(
            User user, String message) {

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());

        return response;
    }

    private boolean passwordMatchesAndUpgrade(
            User user, String rawPassword) {

        String storedPassword = user.getPassword();

        if (storedPassword == null || storedPassword.isBlank()) {
            return false;
        }

        boolean isBcrypt =
                storedPassword.startsWith("$2a$")
                || storedPassword.startsWith("$2b$")
                || storedPassword.startsWith("$2y$");

        if (isBcrypt) {
            try {
                return passwordEncoder.matches(rawPassword, storedPassword);
            } catch (IllegalArgumentException ex) {
                return false;
            }
        }

        // Temporary migration for legacy plaintext passwords.
        if (rawPassword.equals(storedPassword)) {
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
            return true;
        }

        return false;
    }

    private ResponseEntity<?> authenticate(
            String email,
            String password,
            String allowedRole,
            HttpServletRequest request) {

        if (email == null || email.isBlank()
                || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Email and password are required"));
        }

        Optional<User> userOptional =
                userRepository.findByEmailIgnoreCase(email.trim());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Invalid email or password"));
        }

        User user = userOptional.get();

        if (user.getRole() == null
                || !user.getRole().equalsIgnoreCase(allowedRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "message", "This account does not have the required role"));
        }

        if (!passwordMatchesAndUpgrade(user, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Invalid email or password"));
        }

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "message", "Please verify your email before logging in"));
        }

        if (("TEACHER".equalsIgnoreCase(allowedRole)
                || "ADMIN".equalsIgnoreCase(allowedRole))
                && !Boolean.TRUE.equals(user.getApproved())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "message", "Your account is awaiting admin approval"));
        }

        createLoginSession(request, user);

        return ResponseEntity.ok(userResponse(user, "Login successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> loginData,
            HttpServletRequest request) {

        return authenticate(
                loginData.get("email"),
                loginData.get("password"),
                "STUDENT",
                request);
    }

    @PostMapping("/teacher-login")
    public ResponseEntity<?> teacherLogin(
            @RequestBody Map<String, String> loginData,
            HttpServletRequest request) {

        return authenticate(
                loginData.get("email"),
                loginData.get("password"),
                "TEACHER",
                request);
    }

    @PostMapping("/admin-login")
    public ResponseEntity<?> adminLogin(
            @RequestBody Map<String, String> loginData,
            HttpServletRequest request) {

        return authenticate(
                loginData.get("email"),
                loginData.get("password"),
                "ADMIN",
                request);
    }

    @GetMapping("/me")
    public ResponseEntity<?> currentUser(
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null
                || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Not logged in"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("id", session.getAttribute("userId"));
        response.put("name", session.getAttribute("name"));
        response.put("email", session.getAttribute("email"));
        response.put("role", session.getAttribute("role"));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Logged out successfully"));
    }
}