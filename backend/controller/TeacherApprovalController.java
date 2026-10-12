package com.intellicampus.backend.controller;

import com.intellicampus.backend.entity.User;
import com.intellicampus.backend.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/teachers")
@CrossOrigin(
    origins = "http://localhost:5173",
    allowCredentials = "true"
)
public class TeacherApprovalController {

    private final UserRepository userRepository;

    public TeacherApprovalController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private boolean isAdmin(HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        return session != null
                && session.getAttribute("userId") != null
                && "ADMIN".equalsIgnoreCase(
                    String.valueOf(session.getAttribute("role"))
                );
    }

    // View all teacher accounts and their approval status
    @GetMapping
    public ResponseEntity<?> getTeachers(
            HttpServletRequest request) {

        if (!isAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                Map.of(
                    "success", false,
                    "message", "Only an admin can view teacher accounts."
                )
            );
        }

        var teachers = userRepository.findAll()
                .stream()
                .filter(user -> "TEACHER".equalsIgnoreCase(user.getRole()))
                .map(user -> Map.<String, Object>of(
                    "id", user.getId(),
                    "name", user.getName() == null ? "" : user.getName(),
                    "email", user.getEmail() == null ? "" : user.getEmail(),
                    "approved", Boolean.TRUE.equals(user.getApproved()),
                    "emailVerified",
                        Boolean.TRUE.equals(user.getEmailVerified())
                ))
                .toList();

        return ResponseEntity.ok(teachers);
    }

    // Approve or reject a teacher account
    @PutMapping("/{id}/approval")
    public ResponseEntity<?> updateApproval(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body,
            HttpServletRequest request) {

        if (!isAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                Map.of(
                    "success", false,
                    "message", "Only an admin can approve teachers."
                )
            );
        }

        Boolean approved = body.get("approved");

        if (approved == null) {
            return ResponseEntity.badRequest().body(
                Map.of(
                    "success", false,
                    "message", "Please provide approved: true or false."
                )
            );
        }

        User teacher = userRepository.findById(id).orElse(null);

        if (teacher == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of(
                    "success", false,
                    "message", "Account not found."
                )
            );
        }

        if (!"TEACHER".equalsIgnoreCase(teacher.getRole())) {
            return ResponseEntity.badRequest().body(
                Map.of(
                    "success", false,
                    "message", "This account is not a teacher."
                )
            );
        }

        teacher.setApproved(approved);
        userRepository.save(teacher);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", approved
                ? "Teacher approved. Email verification is still required."
                : "Teacher approval revoked.",
            "id", teacher.getId(),
            "approved", approved,
            "emailVerified",
                Boolean.TRUE.equals(teacher.getEmailVerified())
        ));
    }
}