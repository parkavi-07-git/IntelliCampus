package com.intellicampus.backend.repository;

import com.intellicampus.backend.entity.Mark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MarkRepository extends JpaRepository<Mark, Long> {

    List<Mark> findByStudentEmail(String studentEmail);

    List<Mark> findByCourseCode(String courseCode);

}