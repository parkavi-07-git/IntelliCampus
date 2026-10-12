package com.intellicampus.backend.repository;

import com.intellicampus.backend.entity.Marks;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MarksRepository extends JpaRepository<Marks, Long> {

    List<Marks> findByStudentEmail(String studentEmail);

}