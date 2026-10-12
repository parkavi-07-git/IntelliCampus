import { useEffect, useState } from "react";
import "./TeacherDashboard.css";
import AttendancePortal from "./AttendancePortal";
import TeacherTimetable from "./TeacherTimetable";

const API = "http://localhost:8080";

const emptyStudentForm = {
  name: "",
  email: "",
  department: "",
  yearOfStudy: "1",
};

function TeacherDashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({ ...emptyStudentForm });
  const [savingStudent, setSavingStudent] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const request = async (url, options = {}) => {
    const response = await fetch(`${API}${url}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      let detail = "";

      try {
        const data = await response.json();
        detail = data.message || data.error || "";
      } catch {
        // The response might not contain JSON.
      }

      throw new Error(detail || `Request failed (${response.status})`);
    }

    if (response.status === 204) return null;

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return response.json();
    }

    return null;
  };

  const loadStudents = async () => {
    try {
      const data = await request("/api/students");
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Student loading error:", err);
      setError(`Could not load students: ${err.message}`);
    }
  };

  const loadCourses = async () => {
    try {
      const data = await request("/api/courses");
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Course loading error:", err);
      setError(`Could not load courses: ${err.message}`);
    }
  };

  const refreshAttendance = async () => {
    try {
      const data = await request("/api/attendance");
      setAttendance(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Attendance loading error:", err);
    }
  };

  useEffect(() => {
    loadStudents();
    loadCourses();
    refreshAttendance();
  }, []);

  const loadAssignments = async (studentId) => {
    if (!studentId) {
      setAssignedCourses([]);
      return;
    }

    setLoadingAssignments(true);
    setError("");
    setMessage("");

    try {
      const data = await request(
        `/api/student-courses/student/${studentId}`
      );

      setAssignedCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setAssignedCourses([]);
      setError(`Could not load assignments: ${err.message}`);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleStudentChange = (event) => {
    const id = event.target.value;

    setSelectedStudentId(id);
    setSelectedCourseId("");
    setAssignedCourses([]);
    setMessage("");
    setError("");

    if (id) {
      loadAssignments(id);
    }
  };

  const handleStudentFormChange = (event) => {
    const { name, value } = event.target;

    setStudentForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddStudent = async (event) => {
    event.preventDefault();
    setSavingStudent(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        name: studentForm.name.trim(),
        email: studentForm.email.trim(),
        department: studentForm.department.trim(),
        yearOfStudy: Number(studentForm.yearOfStudy),
      };

      await request("/api/students", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setMessage("Student added successfully!");
      setStudentForm({ ...emptyStudentForm });
      setShowAddStudent(false);

      await loadStudents();
    } catch (err) {
      setError(`Could not add student: ${err.message}`);
    } finally {
      setSavingStudent(false);
    }
  };

  const handleAssignCourse = async (event) => {
    event.preventDefault();

    if (!selectedStudentId || !selectedCourseId) {
      setError("Please select a student and a course.");
      return;
    }

    setSavingAssignment(true);
    setError("");
    setMessage("");

    try {
      await request("/api/student-courses", {
        method: "POST",
        body: JSON.stringify({
          studentId: Number(selectedStudentId),
          courseId: Number(selectedCourseId),
        }),
      });

      setMessage("Course assigned to the student successfully!");
      setSelectedCourseId("");
      await loadAssignments(selectedStudentId);
    } catch (err) {
      setError(`Could not assign course: ${err.message}`);
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleRemoveCourse = async (courseId) => {
    const confirmed = window.confirm(
      "Remove this course from this student? The course itself will not be deleted."
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await request(
        `/api/student-courses/student/${selectedStudentId}/course/${courseId}`,
        { method: "DELETE" }
      );

      setMessage("Course removed from this student.");
      await loadAssignments(selectedStudentId);
    } catch (err) {
      setError(`Could not remove assignment: ${err.message}`);
    }
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  const renderDashboard = () => (
    <div>
      <div className="teacher-welcome">
        <div>
          <h2>Welcome back, {user?.name || "Teacher"}!</h2>
          <p>Manage students, course assignments and attendance.</p>
        </div>

        <div className="teacher-role-badge">
          {user?.role || "TEACHER"}
        </div>
      </div>

      <div className="teacher-stats">
        <div className="teacher-stat-card">
          <div className="teacher-stat-icon" aria-hidden="true">🎓</div>
          <div className="teacher-stat-info">
            <span>Total Students</span>
            <strong>{students.length}</strong>
          </div>
        </div>

        <div className="teacher-stat-card">
          <div className="teacher-stat-icon" aria-hidden="true">📚</div>
          <div className="teacher-stat-info">
            <span>Total Courses</span>
            <strong>{courses.length}</strong>
          </div>
        </div>

        <div className="teacher-stat-card">
          <div className="teacher-stat-icon" aria-hidden="true">📊</div>
          <div className="teacher-stat-info">
            <span>Attendance Records</span>
            <strong>{attendance.length}</strong>
          </div>
        </div>

        <div className="teacher-stat-card">
          <div className="teacher-stat-icon" aria-hidden="true">🟢</div>
          <div className="teacher-stat-info">
            <span>Portal Status</span>
            <strong className="online">Online</strong>
          </div>
        </div>
      </div>

      <div className="teacher-dashboard-grid">
        <div className="teacher-panel">
          <div className="teacher-panel-header">
            <div>
              <h3>Student Management</h3>
              <p>View registered students and manage their courses.</p>
            </div>

            <button
              type="button"
              onClick={() => setActivePage("Students")}
            >
              View Students
            </button>
          </div>

          <div className="mini-list">
            {students.length === 0 ? (
              <p className="empty-text">No students found.</p>
            ) : (
              students.slice(0, 5).map((student) => (
                <div className="mini-student" key={student.id}>
                  <div className="mini-avatar">
                    {student.name?.charAt(0)?.toUpperCase() || "S"}
                  </div>

                  <div>
                    <strong>{student.name}</strong>
                    <span>
                      {student.department || "Department not assigned"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="teacher-panel">
          <div className="teacher-panel-header">
            <div>
              <h3>Attendance Management</h3>
              <p>Manage student attendance records.</p>
            </div>

            <button
              type="button"
              onClick={() => setActivePage("Attendance")}
            >
              Manage Attendance
            </button>
          </div>

          <div className="attendance-preview">
            <div className="attendance-big">{attendance.length}</div>
            <p>Attendance records available</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="teacher-content-card">
      <div className="teacher-section-title">
        <div>
          <h2>Student Management</h2>
          <p>View and register students in IntelliCampus.</p>
        </div>

        <button
          type="button"
          className="add-student-button"
          onClick={() => {
            setShowAddStudent((previous) => !previous);
            setMessage("");
            setError("");
          }}
        >
          {showAddStudent ? "Cancel" : "+ Add Student"}
        </button>
      </div>

      {error && (
        <div className="student-feedback student-feedback-error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="student-feedback student-feedback-success" role="status">
          {message}
        </div>
      )}

      {showAddStudent && (
        <form className="add-student-form" onSubmit={handleAddStudent}>
          <div className="add-student-form-heading">
            <h3>Register New Student</h3>
            <p>Enter the student's academic details below.</p>
          </div>

          <div className="add-student-grid">
            <label>
              Full Name
              <input
                type="text"
                name="name"
                value={studentForm.name}
                onChange={handleStudentFormChange}
                placeholder="Enter student name"
                required
              />
            </label>

            <label>
              Email Address
              <input
                type="email"
                name="email"
                value={studentForm.email}
                onChange={handleStudentFormChange}
                placeholder="student@example.com"
                required
              />
            </label>

            <label>
              Department
              <input
                type="text"
                name="department"
                value={studentForm.department}
                onChange={handleStudentFormChange}
                placeholder="e.g. Information Technology"
                required
              />
            </label>

            <label>
              Year of Study
              <select
                name="yearOfStudy"
                value={studentForm.yearOfStudy}
                onChange={handleStudentFormChange}
                required
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </label>
          </div>

          <div className="add-student-actions">
            <button
              type="button"
              className="cancel-student-button"
              onClick={() => {
                setShowAddStudent(false);
                setStudentForm({ ...emptyStudentForm });
              }}
              disabled={savingStudent}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="add-student-button"
              disabled={savingStudent}
            >
              {savingStudent ? "Saving Student..." : "Save Student"}
            </button>
          </div>
        </form>
      )}

      <div className="student-list-heading">
        <h3>Registered Students</h3>
        <span>{students.length} total</span>
      </div>

      {students.length === 0 ? (
        <div className="teacher-empty">
          <div className="teacher-empty-icon">🎓</div>
          <h3>No students registered yet</h3>
          <p>Click “Add Student” to register the first student.</p>
        </div>
      ) : (
        <div className="teacher-table-wrapper">
          <table className="teacher-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Year</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>#{student.id}</td>
                  <td><strong>{student.name}</strong></td>
                  <td>{student.email}</td>
                  <td>{student.department || "-"}</td>
                  <td>{student.yearOfStudy ?? student.year ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderCourses = () => {
    const assignedIds = new Set(
      assignedCourses.map((assignment) => Number(assignment.courseId))
    );

    const availableCourses = courses.filter(
      (course) => !assignedIds.has(Number(course.id))
    );

    return (
      <div className="teacher-content-card">
        <div className="teacher-section-title">
          <div>
            <h2>Student Course Assignments</h2>
            <p>Assign or remove a course for an individual student.</p>
          </div>
        </div>

        {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
        {message && <p role="status" style={{ color: "#15803d" }}>{message}</p>}

        <div style={{ margin: "20px 0" }}>
          <label htmlFor="assignment-student">
            <strong>Select student</strong>
          </label>

          <select
            id="assignment-student"
            value={selectedStudentId}
            onChange={handleStudentChange}
            style={{
              display: "block",
              width: "100%",
              maxWidth: "500px",
              padding: "10px",
              marginTop: "8px",
            }}
          >
            <option value="">Choose a student</option>

            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} — {student.email}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleAssignCourse} style={{ margin: "20px 0" }}>
          <label htmlFor="assignment-course">
            <strong>Select course to assign</strong>
          </label>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginTop: "8px",
            }}
          >
            <select
              id="assignment-course"
              value={selectedCourseId}
              onChange={(event) => setSelectedCourseId(event.target.value)}
              disabled={!selectedStudentId || availableCourses.length === 0}
              style={{ padding: "10px", minWidth: "240px" }}
            >
              <option value="">Choose a course</option>

              {availableCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} — {course.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={
                !selectedStudentId ||
                !selectedCourseId ||
                savingAssignment
              }
            >
              {savingAssignment ? "Assigning..." : "Assign Course"}
            </button>
          </div>

          {selectedStudentId && courses.length === 0 && (
            <p>No courses exist in the course catalog yet.</p>
          )}

          {selectedStudentId &&
            courses.length > 0 &&
            availableCourses.length === 0 && (
              <p>All courses in the catalog are already assigned to this student.</p>
            )}
        </form>

        <h3>Courses assigned to selected student</h3>

        {!selectedStudentId ? (
          <p>Select a student to view their assignments.</p>
        ) : loadingAssignments ? (
          <p>Loading assignments...</p>
        ) : assignedCourses.length === 0 ? (
          <p>No courses assigned to this student yet.</p>
        ) : (
          <div className="teacher-table-wrapper">
            <table className="teacher-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Course Code</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {assignedCourses.map((assignment) => {
                  const course = courses.find(
                    (item) =>
                      Number(item.id) === Number(assignment.courseId)
                  );

                  return (
                    <tr key={assignment.id}>
                      <td>
                        {course?.name || `Course #${assignment.courseId}`}
                      </td>
                      <td>{course?.code || "-"}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleRemoveCourse(assignment.courseId)}
                        >
                          Remove from student
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <h3 style={{ marginTop: "30px" }}>Course Catalog</h3>
        <p>
          These courses can be assigned to students. This page does not delete
          catalog courses.
        </p>

        {courses.length === 0 ? (
          <p>
            No courses have been added to the catalog yet. Ask an administrator
            to add courses.
          </p>
        ) : (
          <div className="teacher-table-wrapper">
            <table className="teacher-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Credits</th>
                  <th>Department</th>
                </tr>
              </thead>

              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.code}</td>
                    <td>{course.name}</td>
                    <td>{course.credits ?? "-"}</td>
                    <td>{course.department || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="teacher-app">
      <aside className="teacher-sidebar">
        <div className="teacher-logo-text">IntelliCampus</div>
        <div className="teacher-sidebar-title">MANAGEMENT PORTAL</div>

        <nav>
          {[
            ["Dashboard", "▦", "Dashboard"],
            ["Students", "♙", "Students"],
            ["Courses", "▤", "Courses"],
            ["Attendance", "◷", "Attendance"],
            ["Timetable", "▦", "Timetable Management"],
          ].map(([page, icon, label]) => (
            <button
              key={page}
              type="button"
              className={activePage === page ? "teacher-nav active" : "teacher-nav"}
              onClick={() => {
                setActivePage(page);
                setError("");
                setMessage("");
              }}
            >
              <span className="teacher-nav-icon" aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="teacher-logout"
          onClick={handleLogout}
        >
          <span aria-hidden="true">↪</span>
          <span>Logout</span>
        </button>
      </aside>

      <main className="teacher-main">
        <header className="teacher-topbar">
          <div>
            <h1>
              {activePage === "Timetable" ? "Timetable Management" : activePage}
            </h1>
            <p>Teacher Portal</p>
          </div>

          <div className="teacher-profile">
            <div className="teacher-profile-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "T"}
            </div>

            <div>
              <strong>{user?.name || "Teacher"}</strong>
              <span>{user?.role || "TEACHER"}</span>
            </div>
          </div>
        </header>

        <section className="teacher-page-content">
          {activePage === "Dashboard" && renderDashboard()}
          {activePage === "Students" && renderStudents()}
          {activePage === "Courses" && renderCourses()}

          {activePage === "Attendance" && (
            <AttendancePortal
              students={students}
              courses={courses}
              onUpdated={refreshAttendance}
            />
          )}

          {activePage === "Timetable" && <TeacherTimetable />}
        </section>
      </main>
    </div>
  );
}

export default TeacherDashboard;
