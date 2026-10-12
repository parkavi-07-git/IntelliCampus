
import { useEffect, useState } from "react";

const API = "http://localhost:8080/api";

export default function AttendancePortal({
  students = [],
  courses = [],
  onUpdated = () => {},
}) {
  const [records, setRecords] = useState([]);
  const [courseCode, setCourseCode] = useState("");
  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadAttendance = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API}/attendance`, {
  credentials: "include",
});
      if (!response.ok) {
        throw new Error("Could not load attendance records.");
      }

      const data = await response.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const selectedCourse = courses.find(
    (course) => course.code === courseCode
  );

  const courseRecords = records.filter(
    (record) =>
      record.courseCode === courseCode &&
      record.date === date
  );

  useEffect(() => {
    const initialStatuses = {};

    students.forEach((student) => {
      const existing = courseRecords.find(
        (record) => String(record.studentId) === String(student.id)
      );

      initialStatuses[student.id] =
        existing ? Boolean(existing.present) : true;
    });

    setStatuses(initialStatuses);
  }, [courseCode, date, students, records]);

  const saveAttendance = async () => {
    if (!courseCode || !date) {
      setMessage("Please select a course and date.");
      return;
    }

    if (students.length === 0) {
      setMessage("No students are available to mark.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const payload = students.map((student) => ({
        studentId: student.id,
        studentName: student.name,
        courseCode,
        courseName: selectedCourse?.name || courseCode,
        date,
        present: Boolean(statuses[student.id]),
      }));

      const response = await fetch(`${API}/attendance/bulk`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(
          details || "Attendance could not be saved."
        );
      }

      setMessage("Attendance saved successfully! âœ…");
      await loadAttendance();
      onUpdated();
    } catch (error) {
      setMessage(
        `${error.message} Check that the backend bulk endpoint accepts a list of attendance records.`
      );
    } finally {
      setSaving(false);
    }
  };

  const percentageFor = (studentId) => {
    const studentRecords = records.filter(
      (record) =>
        String(record.studentId) === String(studentId) &&
        record.courseCode === courseCode
    );

    if (studentRecords.length === 0) return 0;

    const presentCount = studentRecords.filter(
      (record) => record.present
    ).length;

    return Math.round(
      (presentCount / studentRecords.length) * 100
    );
  };

  return (
    <div className="teacher-content-card">
      <div className="teacher-section-title">
        <div>
          <h2>ðŸ“Š Attendance Management</h2>
          <p>Mark, save, and review individual student attendance.</p>
        </div>

        <button type="button" onClick={loadAttendance}>
          â†» Refresh
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          margin: "20px 0",
        }}
      >
        <label>
          <strong>Course</strong>
          <br />
          <select
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            style={{ padding: 10, marginTop: 6, minWidth: 220 }}
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.id ?? course.code} value={course.code}>
                {course.name} ({course.code})
              </option>
            ))}
          </select>
        </label>

        <label>
          <strong>Attendance date</strong>
          <br />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: 10, marginTop: 6 }}
          />
        </label>
      </div>

      {message && (
        <p role="status" style={{ padding: 10, background: "#f3f4f6" }}>
          {message}
        </p>
      )}

      {!courseCode ? (
        <p>Select a course to mark attendance.</p>
      ) : students.length === 0 ? (
        <p>No students found. Check the students API.</p>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table className="teacher-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Present?</th>
                  <th>Course Attendance</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>
                      <select
                        value={statuses[student.id] ? "present" : "absent"}
                        onChange={(e) =>
                          setStatuses((previous) => ({
                            ...previous,
                            [student.id]: e.target.value === "present",
                          }))
                        }
                        aria-label={`Attendance for ${student.name}`}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                      </select>
                    </td>
                    <td>{percentageFor(student.id)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={saveAttendance}
            disabled={saving || loading}
            style={{
              marginTop: 20,
              padding: "12px 20px",
              background: "#2563eb",
              color: "white",
              border: 0,
              borderRadius: 8,
              cursor: saving ? "wait" : "pointer",
            }}
          >
            {saving ? "Saving..." : "ðŸ’¾ Save Attendance"}
          </button>
        </>
      )}

      <h3 style={{ marginTop: 32 }}>Attendance History</h3>

      {loading ? (
        <p>Loading attendance records...</p>
      ) : records.length === 0 ? (
        <p>No attendance records have been saved yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="teacher-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records
                .filter(
                  (record) =>
                    !courseCode || record.courseCode === courseCode
                )
                .map((record) => (
                  <tr key={record.id}>
                    <td>{record.studentName}</td>
                    <td>
                      {record.courseName} ({record.courseCode})
                    </td>
                    <td>{record.date}</td>
                    <td>{record.present ? "âœ… Present" : "âŒ Absent"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

