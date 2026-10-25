import { useState } from "react";
import "./AddCourse.css";

function AddCourse({ onCourseAdded, onCancel }) {

  const [form, setForm] = useState({
    name: "",
    code: "",
    credits: "",
    teacher: "",
    department: "",
    semester: "",
    academicYear: "",
    attendance: 0,
    marks: 0,
    progress: 0
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (
      !form.name ||
      !form.code ||
      !form.credits ||
      !form.teacher ||
      !form.department ||
      !form.semester ||
      !form.academicYear
    ) {
      setMessage("Please fill all required fields.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {

      const response = await fetch(
        "http://localhost:8080/api/courses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            name: form.name,
            code: form.code,
            credits: Number(form.credits),
            teacher: form.teacher,
            department: form.department,
            semester: Number(form.semester),
            academicYear: form.academicYear,
            attendance: 0,
            marks: 0,
            progress: 0
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${errorText || response.statusText}`
        );
      }

      const newCourse = await response.json();

      setMessage("Course added successfully! ✅");

      setForm({
        name: "",
        code: "",
        credits: "",
        teacher: "",
        department: "",
        semester: "",
        academicYear: "",
        attendance: 0,
        marks: 0,
        progress: 0
      });

      if (onCourseAdded) {
        onCourseAdded(newCourse);
      }

    } catch (error) {

      console.error("Add course error:", error);
      setMessage(error.message || "Could not add course.");

    } finally {

      setSaving(false);

    }
  };

  return (
    <div className="add-course-page">

      <div className="add-course-header">

        <div>
          <h2>➕ Add Subject</h2>
          <p>Add your semester subject details</p>
        </div>

        <button
          className="cancel-course-button"
          onClick={onCancel}
          type="button"
        >
          ← Back
        </button>

      </div>

      <form
        className="course-form"
        onSubmit={handleSubmit}
      >

        <div className="form-section">

          <h3>📚 Subject Information</h3>

          <div className="form-grid">

            <div className="form-group">
              <label>Subject Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Example: Machine Learning"
              />
            </div>

            <div className="form-group">
              <label>Subject Code *</label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="Example: CS401"
              />
            </div>

            <div className="form-group">
              <label>Credits *</label>
              <input
                type="number"
                name="credits"
                value={form.credits}
                onChange={handleChange}
                placeholder="Example: 4"
                min="1"
                max="10"
              />
            </div>

            <div className="form-group">
              <label>Teacher / Faculty *</label>
              <input
                name="teacher"
                value={form.teacher}
                onChange={handleChange}
                placeholder="Example: Dr. Arun Kumar"
              />
            </div>

            <div className="form-group">
              <label>Department *</label>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Example: Computer Science"
              />
            </div>

            <div className="form-group">
              <label>Semester *</label>
              <select
                name="semester"
                value={form.semester}
                onChange={handleChange}
              >
                <option value="">Select Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>

            <div className="form-group">
              <label>Academic Year *</label>
              <input
                name="academicYear"
                value={form.academicYear}
                onChange={handleChange}
                placeholder="Example: 2026-27"
              />
            </div>

          </div>

        </div>

        {message && (
          <div className="course-message">
            {message}
          </div>
        )}

        <button
          className="save-course-button"
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : "✓ Add Subject"}
        </button>

      </form>

    </div>
  );
}

export default AddCourse;
