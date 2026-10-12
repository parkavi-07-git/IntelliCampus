package com.intellicampus.backend.controller;

import com.intellicampus.backend.entity.Student;
import com.intellicampus.backend.entity.StudentCourse;
import com.intellicampus.backend.repository.StudentCourseRepository;
import com.intellicampus.backend.repository.StudentRepository;
import com.intellicampus.backend.repository.CourseRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student-courses")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class StudentCourseController {

    private final StudentCourseRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    public StudentCourseController(
            StudentCourseRepository assignmentRepository,
            StudentRepository studentRepository,
            CourseRepository courseRepository) {
        this.assignmentRepository = assignmentRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
    }

    private String getRole(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return null;

        Object role = session.getAttribute("role");
        return role instanceof String ? ((String) role).toUpperCase() : null;
    }

    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Please log in first."));
    }

    private ResponseEntity<?> forbidden() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "You are not allowed to perform this action."));
    }

    // Student: get only their own assigned courses
    @GetMapping("/me")
    public ResponseEntity<?> getMyCourses(HttpServletRequest request) {
        String role = getRole(request);
        if (role == null) return unauthorized();
        if (!role.equals("STUDENT")) return forbidden();

        HttpSession session = request.getSession(false);
        Object emailValue = session.getAttribute("email");

        if (!(emailValue instanceof String email)) {
            return unauthorized();
        }

        Student student = studentRepository.findByEmailIgnoreCase(email)
                .orElse(null);

        if (student == null) {
            return ResponseEntity.ok(List.of());
        }

        List<Map<String, Object>> courses =
                assignmentRepository.findByStudentId(student.getId())
                        .stream()
                        .map(assignment -> courseRepository.findById(assignment.getCourseId())
                                .map(course -> Map.<String, Object>of(
                                        "id", course.getId(),
                                        "code", course.getCode() == null ? "" : course.getCode(),
                                        "name", course.getName() == null ? "" : course.getName(),
                                        "teacher", course.getTeacher() == null ? "" : course.getTeacher(),
                                        "credits", course.getCredits() == null ? 0 : course.getCredits(),
                                        "department", course.getDepartment() == null ? "" : course.getDepartment(),
                                        "semester", course.getSemester() == null ? 0 : course.getSemester()
                                ))
                                .orElse(null))
                        .filter(course -> course != null)
                        .toList();

        return ResponseEntity.ok(courses);
    }

    // Teacher/admin: view assignments for a specific student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentCourses(
            @PathVariable Long studentId,
            HttpServletRequest request) {
        String role = getRole(request);
        if (role == null) return unauthorized();
        if (!role.equals("TEACHER") && !role.equals("ADMIN")) return forbidden();

        if (!studentRepository.existsById(studentId)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(assignmentRepository.findByStudentId(studentId));
    }

    // Teacher/admin: assign a course to a student
    @PostMapping
    public ResponseEntity<?> assignCourse(
            @RequestBody Map<String, Long> body,
            HttpServletRequest request) {
        String role = getRole(request);
        if (role == null) return unauthorized();
        if (!role.equals("TEACHER") && !role.equals("ADMIN")) return forbidden();

        Long studentId = body.get("studentId");
        Long courseId = body.get("courseId");

        if (studentId == null || courseId == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "studentId and courseId are required."));
        }

        if (!studentRepository.existsById(studentId)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Student not found."));
        }

        if (!courseRepository.existsById(courseId)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Course not found."));
        }

        if (assignmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "This course is already assigned to the student."));
        }

        StudentCourse assignment = assignmentRepository.save(
                new StudentCourse(studentId, courseId));

        return ResponseEntity.status(HttpStatus.CREATED).body(assignment);
    }

    // Teacher/admin: remove a course assignment (not the course itself)
    @DeleteMapping("/student/{studentId}/course/{courseId}")
    public ResponseEntity<?> removeCourse(
            @PathVariable Long studentId,
            @PathVariable Long courseId,
            HttpServletRequest request) {
        String role = getRole(request);
        if (role == null) return unauthorized();
        if (!role.equals("TEACHER") && !role.equals("ADMIN")) return forbidden();

        var assignment = assignmentRepository.findByStudentIdAndCourseId(studentId, courseId);

        if (assignment.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        assignmentRepository.delete(assignment.get());
        return ResponseEntity.noContent().build();
    }
}
