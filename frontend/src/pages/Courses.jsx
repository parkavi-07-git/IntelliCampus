import { useEffect, useState } from "react";
import "./Courses.css";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourses() {
      try {
        const response = await fetch(
          "http://localhost:8080/api/student-courses/me",
          { credentials: "include" }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Session expired. Please log in again.");
          }
          if (response.status === 403) {
            throw new Error("Please log in using a student account.");
          }
          throw new Error("Unable to load assigned courses.");
        }

        const data = await response.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Unable to connect to the backend.");
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  return (
    <div className="courses-page">
      <div className="courses-header">
        <div>
          <h1>My Courses</h1>
          <p>View the courses assigned to you by your teacher.</p>
        </div>
        <div className="courses-count">
          <strong>{courses.length}</strong>
          <span>Assigned Courses</span>
        </div>
      </div>

      {loading && <p>Loading your courses...</p>}

      {!loading && error && (
        <p role="alert">{error}</p>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="courses-empty">
          <h2>No courses assigned yet</h2>
          <p>Your teacher's course assignments will appear here.</p>
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="courses-grid">
          {courses.map((course) => (
            <article className="course-card" key={course.id}>
              <div className="course-card-top">
                <span className="course-code">
                  {course.code || "COURSE"}
                </span>
                <span className="course-credits">
                  {course.credits ?? 0} credits
                </span>
              </div>

              <h2>{course.name}</h2>
              <p><strong>Teacher:</strong> {course.teacher || "Not specified"}</p>
              <p><strong>Department:</strong> {course.department || "Not specified"}</p>
              <p><strong>Semester:</strong> {course.semester || "Not specified"}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Courses;