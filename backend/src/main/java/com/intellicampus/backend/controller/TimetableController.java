package com.intellicampus.backend.controller;

import com.intellicampus.backend.model.Timetable;
import com.intellicampus.backend.repository.TimetableRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/timetable")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class TimetableController {

    private final TimetableRepository repository;

    public TimetableController(TimetableRepository repository) {
        this.repository = repository;
    }

    private String requireRole(HttpSession session, String... roles) {
        Object value = session.getAttribute("role");

        if (value == null) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Please log in again."
            );
        }

        String role = value.toString().toUpperCase();

        for (String allowed : roles) {
            if (role.equals(allowed)) return role;
        }

        throw new ResponseStatusException(
            HttpStatus.FORBIDDEN, "You do not have permission."
        );
    }

    @GetMapping
    public List<Timetable> getTimetable() {
        return repository.findAll();
    }

    @PostMapping
    public Timetable createTimetable(
        @RequestBody Timetable timetable,
        HttpSession session
    ) {
        requireRole(session, "TEACHER", "ADMIN");

        if (timetable.getDay() == null ||
            timetable.getCourseCode() == null ||
            timetable.getCourseName() == null ||
            timetable.getStartTime() == null ||
            timetable.getEndTime() == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Please fill all required timetable fields."
            );
        }

        if (!timetable.getEndTime().isAfter(timetable.getStartTime())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "End time must be after start time."
            );
        }

        timetable.setId(null);
        return repository.save(timetable);
    }

    @DeleteMapping("/{id}")
    public void deleteTimetable(
        @PathVariable Long id,
        HttpSession session
    ) {
        requireRole(session, "TEACHER", "ADMIN");

        if (!repository.existsById(id)) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Timetable entry not found."
            );
        }

        repository.deleteById(id);
    }
}