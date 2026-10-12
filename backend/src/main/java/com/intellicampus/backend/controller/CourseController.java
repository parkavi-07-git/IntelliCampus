
package com.intellicampus.backend.controller;

import com.intellicampus.backend.entity.Course;
import com.intellicampus.backend.repository.CourseRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(
    origins = "http://localhost:5173",
    allowCredentials = "true"
)
public class CourseController {

    private final CourseRepository courseRepository;

    public CourseController(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    private String getRole(HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        if (session == null) {
            return null;
        }

        Object role = session.getAttribute("role");

        return role instanceof String
                ? ((String) role).toUpperCase()
                : null;
    }

    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Please log in first."));
    }

    private ResponseEntity<?> forbidden() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "You are not allowed to perform this action."));
    }

    @GetMapping
    public ResponseEntity<?> getAllCourses(HttpServletRequest request) {
        String role = getRole(request);

        if (role == null) {
            return unauthorized();
        }

        if (!role.equals("STUDENT")
                && !role.equals("TEACHER")
                && !role.equals("ADMIN")) {
            return forbidden();
        }

        // Courses are currently shared across users.
        // Student-specific course enrollment and teacher assignment
        // filtering still need to be implemented.
        List<Course> courses = courseRepository.findAll();

        return ResponseEntity.ok(courses);
    }

    @PostMapping
    public ResponseEntity<?> createCourse(
            @RequestBody Course course,
            HttpServletRequest request) {

        String role = getRole(request);

        if (role == null) {
            return unauthorized();
        }

        if (!role.equals("TEACHER") && !role.equals("ADMIN")) {
            return forbidden();
        }

        if (course.getName() == null
                || course.getName().isBlank()
                || course.getCode() == null
                || course.getCode().isBlank()
                || course.getCredits() == null
                || course.getCredits() <= 0) {

            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Enter a valid course name, code and credit value."));
        }

        course.setName(course.getName().trim());
        course.setCode(course.getCode().trim());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseRepository.save(course));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(
            @PathVariable Long id,
            HttpServletRequest request) {

        String role = getRole(request);

        if (role == null) {
            return unauthorized();
        }

        if (!role.equals("ADMIN")) {
            return forbidden();
        }

        if (!courseRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        courseRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}
