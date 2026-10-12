import { useEffect, useState } from "react";
import "./TeacherTimetable.css";

const API = "http://localhost:8080/api";

const emptyForm = {
  day: "Monday",
  courseCode: "CS302",
  courseName: "Database Management Systems",
  teacher: "teacher",
  startTime: "09:00",
  endTime: "10:00",
  room: "",
};

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function TeacherTimetable() {
  const [form, setForm] = useState({ ...emptyForm });
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  async function loadTimetable() {
    try {
      const response = await fetch(`${API}/timetable`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Could not load timetable.");
      }

      setItems(await response.json());
    } catch (error) {
      setMessage(error.message || "Could not load timetable.");
      setIsError(true);
    }
  }

  useEffect(() => {
    loadTimetable();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function publishTimetable(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${API}/timetable`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.message || "Could not publish timetable."
        );
      }

      setMessage("Timetable published successfully!");
      setIsError(false);
      setForm({ ...emptyForm });
      await loadTimetable();
    } catch (error) {
      setMessage(error.message || "Could not publish timetable.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  async function deleteEntry(id) {
    if (!window.confirm("Delete this timetable entry?")) {
      return;
    }

    setDeletingId(id);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${API}/timetable/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.message || "Could not delete timetable entry."
        );
      }

      setMessage("Timetable entry deleted successfully.");
      await loadTimetable();
    } catch (error) {
      setMessage(error.message || "Could not delete timetable entry.");
      setIsError(true);
    } finally {
      setDeletingId(null);
    }
  }

  const sortedItems = [...items].sort((a, b) => {
    const dayDifference = days.indexOf(a.day) - days.indexOf(b.day);

    if (dayDifference !== 0) {
      return dayDifference;
    }

    return String(a.startTime || "").localeCompare(
      String(b.startTime || "")
    );
  });

  return (
    <main className="tt-page">
      <header className="tt-heading">
        <h2>Timetable Management</h2>
        <p>
          Create, publish, and manage class schedules for your students.
        </p>
      </header>

      {message && (
        <div
          className={`tt-message${isError ? " error" : ""}`}
          role="status"
        >
          {message}
        </div>
      )}

      <section className="tt-card">
        <div className="tt-card-heading">
          <h3>＋ Create Class Schedule</h3>
          <p>
            Enter the class details below to publish a timetable entry.
          </p>
        </div>

        <form className="tt-form" onSubmit={publishTimetable}>
          <div className="tt-field">
            <label htmlFor="tt-day">Day</label>
            <select
              id="tt-day"
              name="day"
              value={form.day}
              onChange={updateField}
              required
            >
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className="tt-field">
            <label htmlFor="tt-course-code">Course Code</label>
            <input
              id="tt-course-code"
              name="courseCode"
              value={form.courseCode}
              onChange={updateField}
              placeholder="e.g. CS302"
              required
            />
          </div>

          <div className="tt-field">
            <label htmlFor="tt-course-name">Course Name</label>
            <input
              id="tt-course-name"
              name="courseName"
              value={form.courseName}
              onChange={updateField}
              placeholder="e.g. Database Management Systems"
              required
            />
          </div>

          <div className="tt-field">
            <label htmlFor="tt-teacher">Teacher Name</label>
            <input
              id="tt-teacher"
              name="teacher"
              value={form.teacher}
              onChange={updateField}
              placeholder="Enter teacher name"
              required
            />
          </div>

          <div className="tt-field">
            <label htmlFor="tt-start-time">Start Time</label>
            <input
              id="tt-start-time"
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={updateField}
              required
            />
          </div>

          <div className="tt-field">
            <label htmlFor="tt-end-time">End Time</label>
            <input
              id="tt-end-time"
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={updateField}
              required
            />
          </div>

          <div className="tt-field">
            <label htmlFor="tt-room">Classroom / Lab</label>
            <input
              id="tt-room"
              name="room"
              value={form.room}
              onChange={updateField}
              placeholder="e.g. Lab 2"
            />
          </div>

          <div className="tt-form-actions">
            <button
              className="tt-primary-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Publishing..." : "Publish Timetable"}
            </button>
          </div>
        </form>
      </section>

      <section className="tt-card">
        <div className="tt-list-heading">
          <div>
            <h3>Published Timetable</h3>
            <p>Review the schedules currently available to students.</p>
          </div>

          <span className="tt-count">
            {items.length} {items.length === 1 ? "class" : "classes"}
          </span>
        </div>

        <div className="tt-table-wrap">
          <table className="tt-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Course</th>
                <th>Teacher</th>
                <th>Room</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {sortedItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="tt-day">{item.day}</span>
                  </td>

                  <td>
                    <span className="tt-time">
                      {item.startTime} – {item.endTime}
                    </span>
                  </td>

                  <td>
                    <span className="tt-course-name">
                      {item.courseName}
                    </span>
                    <span className="tt-course-code">
                      {item.courseCode}
                    </span>
                  </td>

                  <td>{item.teacher}</td>

                  <td>
                    <span className="tt-room">{item.room || "—"}</span>
                  </td>

                  <td>
                    <button
                      className="tt-delete-btn"
                      type="button"
                      onClick={() => deleteEntry(item.id)}
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}

              {sortedItems.length === 0 && (
                <tr>
                  <td colSpan="6" className="tt-empty">
                    <strong>No timetable entries yet</strong>
                    <span>
                      Publish your first class schedule using the form above.
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
