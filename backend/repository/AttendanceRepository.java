
package com.intellicampus.backend.repository;

import com.intellicampus.backend.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByStudentId(Long studentId);

    List<Attendance> findByCourseCode(String courseCode);

    boolean existsByStudentIdAndCourseCodeAndDate(
            Long studentId,
            String courseCode,
            String date
    );
}
