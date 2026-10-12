
package com.intellicampus.backend.controller;

import com.intellicampus.backend.entity.Student;
import com.intellicampus.backend.entity.User;
import com.intellicampus.backend.repository.StudentRepository;
import com.intellicampus.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth/student-signup")
@CrossOrigin(
    origins = "http://localhost:5173",
    allowCredentials = "true"
)
public class StudentSignupController {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentSignupController(
            StudentRepository studentRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping
    public ResponseEntity<?> signup(
            @RequestBody Map<String, String> requestData) {

        String name = requestData.get("name");
        String email = requestData.get("email");
        String password = requestData.get("password");

        if (name == null || name.isBlank()
                || email == null || email.isBlank()
                || password == null || password.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message",
                "Name, official email and a password of at least 8 characters are required."
            ));
        }

        name = name.trim();
        email = email.trim().toLowerCase(java.util.Locale.ROOT);

        if (!email.matches("^[a-z0-9._%+-]+@ssn\\.edu\\.in$")) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message",
                "Please use your official @ssn.edu.in email address."
            ));
        }

        Optional<Student> studentOptional =
                studentRepository.findByEmailIgnoreCase(email);

        if (studentOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "message",
                "No student record exists for this email. Please contact your teacher."
            ));
        }

        Student student = studentOptional.get();

        if (student.getName() == null
                || !student.getName().trim().equalsIgnoreCase(name)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "message",
                "The name does not match the student record. Please contact your teacher."
            ));
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "success", false,
                "message",
                "An account already exists for this email. Please log in or use password recovery."
            ));
        }

        User user = new User();
        user.setName(student.getName());
        user.setEmail(student.getEmail().trim().toLowerCase(java.util.Locale.ROOT));
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("STUDENT");
        user.setEmailVerified(false);
        user.setApproved(true);

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "success", true,
            "message",
            "Signup received. Email verification must be completed before login."
        ));
    }
}
