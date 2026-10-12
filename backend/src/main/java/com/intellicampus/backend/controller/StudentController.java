package com.intellicampus.backend.controller;

import com.intellicampus.backend.entity.Student;
import com.intellicampus.backend.repository.StudentRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(
    origins = "http://localhost:5173",
    allowCredentials = "true"
)
public class StudentController {

    private final StudentRepository studentRepository;

    public StudentController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    // Read the authenticated server-side session.
    private HttpSession getSession(HttpServletRequest request) {
        return request.getSession(false);
    }

    private boolean hasRole(
            HttpServletRequest request, String... allowedRoles) {

        HttpSession session = getSession(request);

        if (session == null) {
            return false;
        }

        Object roleValue = session.getAttribute("role");

        if (!(roleValue instanceof String)) {
            return false;
        }

        String role = ((String) roleValue).toUpperCase();

        for (String allowedRole : allowedRoles) {
            if (role.equals(allowedRole)) {
                return true;
            }
        }

        return false;
    }

    // TEACHER / ADMIN: Add a student manually.
    @PostMapping
    public ResponseEntity<?> createStudent(
            @RequestBody Student student,
            HttpServletRequest request) {

        if (!hasRole(request, "TEACHER", "ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                        "message",
                        "Only teachers and admins can add students."
                    ));
        }

        if (student.getName() == null || student.getName().isBlank()
                || student.getEmail() == null
                || student.getEmail().isBlank()
                || student.getDepartment() == null
                || student.getDepartment().isBlank()
                || student.getYearOfStudy() == null
                || student.getYearOfStudy() < 1) {

            return ResponseEntity.badRequest().body(Map.of(
                "message",
                "Name, email, department and a valid year are required."
            ));
        }

        String email = student.getEmail().trim();

        if (studentRepository.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                        "message",
                        "A student record already exists for this email."
                    ));
        }

        student.setName(student.getName().trim());
        student.setEmail(email);
        student.setDepartment(student.getDepartment().trim());

        Student savedStudent = studentRepository.save(student);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedStudent);
    }

    // TEACHER / ADMIN: View the student list.
    @GetMapping
    public ResponseEntity<?> getAllStudents(
            HttpServletRequest request) {

        if (!hasRole(request, "TEACHER", "ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                        "message",
                        "Only teachers and admins can view all students."
                    ));
        }

        List<Student> students = studentRepository.findAll();

        return ResponseEntity.ok(students);
    }

    // STUDENT: Retrieve only the profile matching the session email.
    @GetMapping("/me")
    public ResponseEntity<?> getMyStudentProfile(
            HttpServletRequest request) {

        HttpSession session = getSession(request);

        if (session == null ||
                !"STUDENT".equalsIgnoreCase(
                    String.valueOf(session.getAttribute("role")))) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                        "message", "Please log in as a student."
                    ));
        }

        Object emailValue = session.getAttribute("email");

        if (!(emailValue instanceof String)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                        "message", "Your session has no valid email."
                    ));
        }

        String email = ((String) emailValue).trim();

        Optional<Student> student =
                studentRepository.findByEmailIgnoreCase(email);

        if (student.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                        "message",
                        "No student profile is linked to your login email."
                    ));
        }

        return ResponseEntity.ok(student.get());
    }

    // TEACHER / ADMIN: Delete a student record.
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(
            @PathVariable Long id,
            HttpServletRequest request) {

        if (!hasRole(request, "TEACHER", "ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                        "message",
                        "Only teachers and admins can delete student records."
                    ));
        }

        if (!studentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        studentRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}
