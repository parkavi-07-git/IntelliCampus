package com.intellicampus.backend.controller;

import com.intellicampus.backend.entity.Attendance;
import com.intellicampus.backend.entity.Student;
import com.intellicampus.backend.repository.AttendanceRepository;
import com.intellicampus.backend.repository.StudentRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;

    public AttendanceController(
            AttendanceRepository attendanceRepository,
            StudentRepository studentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
    }

    private String requireRole(HttpSession session, String... allowedRoles) {
        Object value = session.getAttribute("role");

        if (value == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Please log in again.");
        }

        String role = value.toString().toUpperCase();

        for (String allowed : allowedRoles) {
            if (role.equals(allowed)) {
                return role;
            }
        }

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, "You do not have permission.");
    }

    @GetMapping
    public List<Attendance> getAttendance(HttpSession session) {
        String role = requireRole(session, "STUDENT", "TEACHER", "ADMIN");

        if ("STUDENT".equals(role)) {
            Object emailValue = session.getAttribute("email");

            if (emailValue == null) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Student email not found in session.");
            }

            Student student = studentRepository
                    .findByEmailIgnoreCase(emailValue.toString())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Student profile not found."));

            return attendanceRepository.findByStudentId(student.getId());
        }

        return attendanceRepository.findAll();
    }

    @GetMapping("/student/{studentId}")
    public List<Attendance> getStudentAttendance(
            @PathVariable Long studentId,
            HttpSession session) {

        requireRole(session, "TEACHER", "ADMIN");
        return attendanceRepository.findByStudentId(studentId);
    }

    @PostMapping
    public Attendance addAttendance(
            @RequestBody Attendance attendance,
            HttpSession session) {

        requireRole(session, "TEACHER", "ADMIN");
        return attendanceRepository.save(attendance);
    }

    @DeleteMapping("/{id}")
    public void deleteAttendance(
            @PathVariable Long id,
            HttpSession session) {

        requireRole(session, "TEACHER", "ADMIN");

        if (!attendanceRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Attendance record not found.");
        }

        attendanceRepository.deleteById(id);
    }
    @PostMapping("/bulk")
public List<Attendance> saveBulkAttendance(
        @RequestBody List<Attendance> attendanceList,
        HttpSession session) {

    requireRole(session, "TEACHER", "ADMIN");

    if (attendanceList == null || attendanceList.isEmpty()) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Attendance list cannot be empty."
        );
    }

    return attendanceRepository.saveAll(attendanceList);
}
}
