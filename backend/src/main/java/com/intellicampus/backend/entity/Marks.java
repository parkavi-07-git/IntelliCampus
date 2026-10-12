package com.intellicampus.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "marks")
public class Marks {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String courseCode;

    private String courseName;

    private String studentEmail;

    private String assessment;

    private Integer marksObtained;

    private Integer maxMarks;

    public Marks() {
    }

    public Marks(
            String courseCode,
            String courseName,
            String studentEmail,
            String assessment,
            Integer marksObtained,
            Integer maxMarks
    ) {
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.studentEmail = studentEmail;
        this.assessment = assessment;
        this.marksObtained = marksObtained;
        this.maxMarks = maxMarks;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getAssessment() {
        return assessment;
    }

    public void setAssessment(String assessment) {
        this.assessment = assessment;
    }

    public Integer getMarksObtained() {
        return marksObtained;
    }

    public void setMarksObtained(Integer marksObtained) {
        this.marksObtained = marksObtained;
    }

    public Integer getMaxMarks() {
        return maxMarks;
    }

    public void setMaxMarks(Integer maxMarks) {
        this.maxMarks = maxMarks;
    }
}