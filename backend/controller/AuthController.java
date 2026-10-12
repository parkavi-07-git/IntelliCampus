package com.intellicampus.backend.controller;

import com.intellicampus.backend.entity.User;
import com.intellicampus.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // STUDENT LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> loginData) {

        String email = loginData.get("email");
        String password = loginData.get("password");

        if (email == null || password == null) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "success", false,
                            "message",
                            "Email and password are required"
                    ));
        }

        Optional<User> userOptional =
                userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "success", false,
                            "message",
                            "Invalid email or password"
                    ));
        }

        User user = userOptional.get();

        if (!password.equals(user.getPassword())) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "success", false,
                            "message",
                            "Invalid email or password"
                    ));
        }

        Map<String, Object> response = new HashMap<>();

        response.put("success", true);
        response.put("message", "Login successful");
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }


    // TEACHER / ADMIN LOGIN
    @PostMapping("/teacher-login")
    public ResponseEntity<?> teacherLogin(
            @RequestBody Map<String, String> loginData) {

        String username = loginData.get("username");
        String password = loginData.get("password");

        if (username == null || password == null) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "success", false,
                            "message",
                            "Username and password are required"
                    ));
        }

        Optional<User> userOptional =
                userRepository.findByName(username);

        if (userOptional.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "success", false,
                            "message",
                            "Invalid teacher username or password"
                    ));
        }

        User user = userOptional.get();

        if (!password.equals(user.getPassword())) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "success", false,
                            "message",
                            "Invalid teacher username or password"
                    ));
        }

        String role = user.getRole();

        if (role == null ||
                (!role.equalsIgnoreCase("TEACHER")
                        && !role.equalsIgnoreCase("ADMIN"))) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "success", false,
                            "message",
                            "You do not have teacher/admin access"
                    ));
        }

        Map<String, Object> response = new HashMap<>();

        response.put("success", true);
        response.put(
                "message",
                "Teacher login successful"
        );
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }
}