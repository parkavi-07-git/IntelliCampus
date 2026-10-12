
package com.intellicampus.backend.controller;

import com.intellicampus.backend.entity.Mark;
import com.intellicampus.backend.repository.MarkRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marks")
@CrossOrigin(
    origins = "http://localhost:5173",
    allowCredentials = "true"
)
public class MarkController {

    private final MarkRepository markRepository;

    public MarkController(MarkRepository markRepository) {
        this.markRepository = markRepository;
    }

    private HttpSession getSession(HttpServletRequest request) {
        return request.getSession(false);
    }

    @GetMapping
    public ResponseEntity<?> getMarks(HttpServletRequest request) {
        HttpSession session = getSession(request);

        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Please log in first."));
        }

        Object roleValue = session.getAttribute("role");
        Object emailValue = session.getAttribute("email");

        if (!(roleValue instanceof String)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid login session."));
        }

        String role = ((String) roleValue).toUpperCase();

        if ("STUDENT".equals(role)) {
            if (!(emailValue instanceof String)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Your session has no valid email."));
            }

            String email = ((String) emailValue).trim();

            List<Mark> myMarks = markRepository.findAll()
                .stream()
                .filter(mark -> mark.getStudentEmail() != null
                    && mark.getStudentEmail().equalsIgnoreCase(email))
                .toList();

            return ResponseEntity.ok(myMarks);
        }

        if ("ADMIN".equals(role) || "TEACHER".equals(role)) {
            // Teacher-to-student assignment filtering must be added
            // before using this endpoint with real student data.
            return ResponseEntity.ok(markRepository.findAll());
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(Map.of("message", "You cannot view marks."));
    }

    @PostMapping
    public ResponseEntity<?> createMark(
            @RequestBody Mark mark,
            HttpServletRequest request) {

        HttpSession session = getSession(request);

        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Please log in first."));
        }

        Object roleValue = session.getAttribute("role");

        if (!(roleValue instanceof String)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid login session."));
        }

        String role = ((String) roleValue).toUpperCase();

        if (!"TEACHER".equals(role) && !"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of(
                    "message",
                    "Only teachers and admins can add marks."
                ));
        }

        if (mark.getCourseCode() == null
                || mark.getCourseName() == null
                || mark.getStudentEmail() == null
                || mark.getAssessment() == null
                || mark.getMarksObtained() == null
                || mark.getMaxMarks() == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "All marks fields are required."));
        }

        if (mark.getMarksObtained() < 0
                || mark.getMaxMarks() <= 0
                || mark.getMarksObtained() > mark.getMaxMarks()) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Please enter valid marks."));
        }

        try {
            mark.setStudentEmail(mark.getStudentEmail().trim());

            Mark savedMark = markRepository.save(mark);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedMark);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Could not save mark."));
        }
    }
}
