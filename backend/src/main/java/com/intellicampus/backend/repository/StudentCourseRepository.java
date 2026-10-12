package com.intellicampus.backend.repository;

import com.intellicampus.backend.entity.StudentCourse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentCourseRepository
        extends JpaRepository<StudentCourse, Long> {

    List<StudentCourse> findByStudentId(Long studentId);

    List<StudentCourse> findByCourseId(Long courseId);

    Optional<StudentCourse> findByStudentIdAndCourseId(
        Long studentId,
        Long courseId
    );

    boolean existsByStudentIdAndCourseId(
        Long studentId,
        Long courseId
    );

    void deleteByStudentIdAndCourseId(
        Long studentId,
        Long courseId
    );
}
