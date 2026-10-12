
import { useEffect, useState } from "react";
import "./Attendance.css";

const API = "http://localhost:8080/api";

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAttendance() {
      try {
        const response = await fetch(`${API}/attendance`, {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Please log in again to view attendance.");
          }
          throw new Error(`Attendance API returned ${response.status}`);
        }

        const data = await response.json();
        const records = Array.isArray(data) ? data : [];

        if (!cancelled) {
          setAttendance(records);
          setError("");
        }
      } catch (err) {
        console.error("Attendance error:", err);

        if (!cancelled) {
          setAttendance([]);
          setError(err.message || "Unable to load attendance right now.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAttendance();

    return () => {
      cancelled = true;
    };
  }, []);

  // Each backend record represents one class.
  const grouped = attendance.reduce((groups, item) => {
    const key = item?.courseCode || item?.courseName || "Other";
    if (!groups[key]) {
      groups[key] = {
        courseCode: item?.courseCode || "COURSE",
        courseName: item?.courseName || "Course",
        totalClasses: 0,
        attendedClasses: 0,
        records: [],
      };
    }

    groups[key].totalClasses += 1;

    if (item?.present === true || String(item?.present).toLowerCase() === "true"
      || String(item?.present).toLowerCase() === "present") {
      groups[key].attendedClasses += 1;
    }

    groups[key].records.push(item);
    return groups;
  }, {});

  const courses = Object.values(grouped);

  const totalClasses = courses.reduce(
    (sum, course) => sum + course.totalClasses, 0
  );

  const attendedClasses = courses.reduce(
    (sum, course) => sum + course.attendedClasses, 0
  );

  const missedClasses = totalClasses - attendedClasses;

  const overallPercentage = totalClasses
    ? ((attendedClasses / totalClasses) * 100).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <div className="attendance-page">
        <div className="attendance-header">
          <div>
            <h2>📊 Attendance</h2>
            <p>Track your attendance across all subjects</p>
          </div>
          <div className="overall-card">
            <span>Overall Attendance</span>
            <strong>Loading...</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <div>
          <h2>📊 Attendance</h2>
          <p>Track your attendance across all subjects</p>
        </div>
        <div className="overall-card">
          <span>Overall Attendance</span>
          <strong>{overallPercentage}%</strong>
        </div>
      </div>

      <div className="attendance-summary">
        <div className="summary-card">
          <span>Total Classes</span>
          <strong>{totalClasses}</strong>
        </div>
        <div className="summary-card">
          <span>Classes Attended</span>
          <strong>{attendedClasses}</strong>
        </div>
        <div className="summary-card">
          <span>Classes Missed</span>
          <strong>{missedClasses}</strong>
        </div>
      </div>

      {error ? (
        <div className="attendance-list">
          <div className="attendance-card">
            <h3>Attendance unavailable</h3>
            <p>{error}</p>
          </div>
        </div>
      ) : courses.length === 0 ? (
        <div className="attendance-list">
          <div className="attendance-card">
            <h3>No attendance records yet</h3>
            <p>Your attendance records will appear here after your teacher saves them.</p>
          </div>
        </div>
      ) : (
        <div className="attendance-list">
          {courses.map((course) => {
            const percentage = course.totalClasses
              ? (course.attendedClasses / course.totalClasses) * 100
              : 0;

            return (
              <div className="attendance-card" key={course.courseCode}>
                <div className="attendance-course">
                  <div>
                    <div className="attendance-code">{course.courseCode}</div>
                    <h3>{course.courseName}</h3>
                  </div>
                  <div className={percentage >= 75
                    ? "attendance-good"
                    : "attendance-warning"}>
                    {percentage.toFixed(1)}%
                  </div>
                </div>

                <div className="attendance-details">
                  <div>
                    <span>Classes</span>
                    <strong>{course.totalClasses}</strong>
                  </div>
                  <div>
                    <span>Attended</span>
                    <strong>{course.attendedClasses}</strong>
                  </div>
                  <div>
                    <span>Missed</span>
                    <strong>{course.totalClasses - course.attendedClasses}</strong>
                  </div>
                </div>

                <div className="attendance-progress">
                  <div
                    className="attendance-progress-bar"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="attendance-details">
                  <div>
                    <span>Attendance dates</span>
                    <strong>
                      {course.records
                        .map((record) => record?.date)
                        .filter(Boolean)
                        .join(", ") || "Not available"}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Attendance;
