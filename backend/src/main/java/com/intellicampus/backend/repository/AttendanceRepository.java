package com.intellicampus.backend.repository;

import com.intellicampus.backend.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByStudentId(Long studentId);

    List<Attendance> findByCourseCode(String courseCode);

    Optional<Attendance> findByStudentIdAndCourseCodeAndDate(
            Long studentId,
            String courseCode,
            String date
    );

    boolean existsByStudentIdAndCourseCodeAndDate(
            Long studentId,
            String courseCode,
            String date
    );
}