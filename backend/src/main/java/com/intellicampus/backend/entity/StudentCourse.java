package com.intellicampus.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "student_courses",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"student_id", "course_id"}
    )
)
public class StudentCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(nullable = false)
    private LocalDateTime assignedAt = LocalDateTime.now();

    public StudentCourse() {
    }

    public StudentCourse(Long studentId, Long courseId) {
        this.studentId = studentId;
        this.courseId = courseId;
        this.assignedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }
}
