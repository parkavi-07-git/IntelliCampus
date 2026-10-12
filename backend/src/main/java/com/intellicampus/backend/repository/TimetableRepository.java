package com.intellicampus.backend.repository;

import com.intellicampus.backend.model.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimetableRepository extends JpaRepository<Timetable, Long> {
}