import { useEffect, useState } from "react";
import "./App.css";
import Courses from "./pages/Courses";
import Attendance from "./pages/Attendance";
import Marks from "./pages/Marks";

function StudentDashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");

  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [timetable, setTimetable] = useState([]);

  const [profileLoading, setProfileLoading] = useState(true);
  const [loadingMarks, setLoadingMarks] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingTimetable, setLoadingTimetable] = useState(false);

  const [aiMessages, setAiMessages] = useState([
    {
      role: "assistant",
      text:
        "Hi! I'm your IntelliCampus AI Assistant 🤖. Ask me about study plans, your courses, marks, attendance, or academic guidance.",
    },
  ]);

  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // -----------------------------------------------------
  // LOAD ONLY THE LOGGED-IN STUDENT'S PROFILE
  // -----------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function loadMyProfile() {
      setProfileLoading(true);

      try {
        const response = await fetch(
          "http://localhost:8080/api/students/me",
          { credentials: "include" }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || "Could not load your student profile."
          );
        }

        if (!cancelled) {
          setStudents([data]);
        }
      } catch (error) {
        console.error("My profile error:", error);

        if (!cancelled) {
          setStudents([]);
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    }

    loadMyProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  // -----------------------------------------------------
  // LOAD COURSES
  // NOTE: The backend must filter courses for this student.
  // -----------------------------------------------------
  useEffect(() => {
    if (!["Courses", "Dashboard", "AI"].includes(activePage)) {
      return;
    }

    let cancelled = false;

    async function loadCourses() {
      setLoadingCourses(true);

      try {
        const response = await fetch(
          "http://localhost:8080/api/courses",
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error("Courses API failed");
        }

        const data = await response.json();
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.value)
            ? data.value
            : [];

        if (!cancelled) {
          setCourses(items);
        }
      } catch (error) {
        console.error("Courses API Error:", error);
        if (!cancelled) setCourses([]);
      } finally {
        if (!cancelled) setLoadingCourses(false);
      }
    }

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, [activePage]);

  // -----------------------------------------------------
  // LOAD MARKS
  // NOTE: The backend must filter marks for this student.
  // -----------------------------------------------------
  useEffect(() => {
    if (!["Dashboard", "Marks", "AI"].includes(activePage)) {
      return;
    }

    let cancelled = false;

    async function loadMarks() {
      setLoadingMarks(true);

      try {
        const response = await fetch(
          "http://localhost:8080/api/marks",
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error("Marks API failed");
        }

        const data = await response.json();
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.value)
            ? data.value
            : [];

        if (!cancelled) {
          setMarks(items);
        }
      } catch (error) {
        console.error("Marks API Error:", error);
        if (!cancelled) setMarks([]);
      } finally {
        if (!cancelled) setLoadingMarks(false);
      }
    }

    loadMarks();

    return () => {
      cancelled = true;
    };
  }, [activePage]);

  // -----------------------------------------------------
  // LOAD TIMETABLE
  // NOTE: The backend must apply the correct student/course
  // access rules before returning timetable data.
  // -----------------------------------------------------
  useEffect(() => {
    if (!["Timetable", "Dashboard", "AI"].includes(activePage)) {
      return;
    }

    let cancelled = false;

    async function loadTimetable() {
      setLoadingTimetable(true);

      try {
        const response = await fetch(
          "http://localhost:8080/api/timetable",
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error("Timetable API failed");
        }

        const data = await response.json();
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.value)
            ? data.value
            : [];

        if (!cancelled) {
          setTimetable(items);
        }
      } catch (error) {
        console.error("Timetable API Error:", error);
        if (!cancelled) setTimetable([]);
      } finally {
        if (!cancelled) setLoadingTimetable(false);
      }
    }

    loadTimetable();

    return () => {
      cancelled = true;
    };
  }, [activePage]);

  const student = students[0] || null;

  // -----------------------------------------------------
  // LOGOUT
  // -----------------------------------------------------
  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (confirmLogout && typeof onLogout === "function") {
      onLogout();
    }
  };

  // -----------------------------------------------------
  // PAGE TITLE
  // -----------------------------------------------------
  const getPageTitle = () => {
    switch (activePage) {
      case "Dashboard":
        return "Dashboard";
      case "Profile":
        return "My Profile";
      case "Courses":
        return "My Courses";
      case "Attendance":
        return "Attendance";
      case "Marks":
        return "Marks & Results";
      case "Timetable":
        return "Timetable";
      case "AI":
        return "AI Assistant";
      default:
        return "Dashboard";
    }
  };

  // -----------------------------------------------------
  // DASHBOARD
  // -----------------------------------------------------
  
  const renderDashboard = () => {
    const totalObtained = marks.reduce(
      (sum, mark) => sum + (Number(mark.marksObtained) || 0),
      0
    );

    const totalMaximum = marks.reduce(
      (sum, mark) => sum + (Number(mark.maxMarks) || 0),
      0
    );

    const averageMarks =
      totalMaximum > 0
        ? Math.round((totalObtained / totalMaximum) * 100)
        : null;

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });

    const todaysClasses = timetable
      .filter((item) => item.day?.toLowerCase() === today.toLowerCase())
      .sort((a, b) =>
        (a.startTime || "").localeCompare(b.startTime || "")
      )
      .slice(0, 3);

    return (
      <div className="dashboard-page">
        <section className="welcome-banner">
          <div>
            <span className="dashboard-eyebrow">STUDENT OVERVIEW</span>
            <h2>
              Welcome{student?.name ? `, ${student.name}` : ""}! 👋
            </h2>
            <p>Your academic journey, all in one place.</p>
          </div>
          <div className="welcome-decoration">🎓</div>
        </section>

        <section className="dashboard-quick-stats">
          <button
            type="button"
            className="quick-stat"
            onClick={() => setActivePage("Courses")}
          >
            <span className="quick-stat-icon">📚</span>
            <span className="quick-stat-copy">
              <small>My Courses</small>
              <strong>{loadingCourses ? "…" : courses.length}</strong>
            </span>
            <span className="quick-stat-arrow">→</span>
          </button>

          <button
            type="button"
            className="quick-stat"
            onClick={() => setActivePage("Marks")}
          >
            <span className="quick-stat-icon">📝</span>
            <span className="quick-stat-copy">
              <small>Average Marks</small>
              <strong>
                {loadingMarks
                  ? "…"
                  : averageMarks === null
                    ? "—"
                    : `${averageMarks}%`}
              </strong>
            </span>
            <span className="quick-stat-arrow">→</span>
          </button>

          <button
            type="button"
            className="quick-stat"
            onClick={() => setActivePage("Attendance")}
          >
            <span className="quick-stat-icon">📊</span>
            <span className="quick-stat-copy">
              <small>Attendance</small>
              <strong>View records</strong>
            </span>
            <span className="quick-stat-arrow">→</span>
          </button>
        </section>

        <section className="dashboard-main-grid">
          <div className="dashboard-card">
            <div className="card-heading">
              <div>
                <h3>📅 Today's Classes</h3>
                <p className="dashboard-card-subtitle">
                  {today}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActivePage("Timetable")}
              >
                Full timetable →
              </button>
            </div>

            {loadingTimetable ? (
              <p className="dashboard-empty">Loading classes…</p>
            ) : todaysClasses.length > 0 ? (
              todaysClasses.map((item, index) => (
                <div className="class-item" key={item.id || index}>
                  <div className="class-time">
                    {item.startTime || "--"}
                  </div>
                  <div className="class-details">
                    <strong>
                      {item.courseName || item.subject || "Class"}
                    </strong>
                    <span>
                      {item.endTime ? `${item.endTime} · ` : ""}
                      {item.room || "Room not assigned"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="dashboard-empty">
                <span>☀️</span>
                <strong>No classes listed for today</strong>
                <p>Check your weekly timetable for other classes.</p>
                <button
                  type="button"
                  onClick={() => setActivePage("Timetable")}
                >
                  Open timetable
                </button>
              </div>
            )}
          </div>

          <div className="dashboard-card">
            <div className="card-heading">
              <div>
                <h3>👤 My Academic Profile</h3>
                <p className="dashboard-card-subtitle">
                  Your student information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActivePage("Profile")}
              >
                View profile →
              </button>
            </div>

            {profileLoading ? (
              <p className="dashboard-empty">Loading profile…</p>
            ) : student ? (
              <div className="dashboard-profile-summary">
                <div className="dashboard-profile-avatar">
                  {student.name?.charAt(0)?.toUpperCase() || "S"}
                </div>
                <div>
                  <h4>{student.name || "Student"}</h4>
                  <p>{student.email || "Email not available"}</p>
                  <span>
                    {student.department || "Department not assigned"}
                    {student.yearOfStudy
                      ? ` · Year ${student.yearOfStudy}`
                      : ""}
                  </span>
                </div>
              </div>
            ) : (
              <p className="dashboard-empty">
                Your profile is currently unavailable.
              </p>
            )}

            <div className="dashboard-shortcuts">
              <button
                type="button"
                onClick={() => setActivePage("Courses")}
              >
                📚 Browse my courses
              </button>
              <button
                type="button"
                onClick={() => setActivePage("AI")}
              >
                🤖 Ask AI Assistant
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  };


  // -----------------------------------------------------
  // PROFILE
  // -----------------------------------------------------
  const renderProfile = () => (
    <div className="content-card profile-page">
      {profileLoading ? (
        <p>Loading your profile...</p>
      ) : !student ? (
        <div>
          <h2>Profile unavailable</h2>
          <p>
            Your student record could not be found. Please contact your
            teacher or administrator.
          </p>
        </div>
      ) : (
        <>
          <div className="profile-header">
            <div className="profile-avatar">
              {student.name?.charAt(0)?.toUpperCase() || "S"}
            </div>
            <div>
              <h2>{student.name}</h2>
              <p>{student.department}</p>
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-detail">
              <span>Full Name</span>
              <strong>{student.name || "—"}</strong>
            </div>
            <div className="profile-detail">
              <span>Email</span>
              <strong>{student.email || "—"}</strong>
            </div>
            <div className="profile-detail">
              <span>Department</span>
              <strong>{student.department || "—"}</strong>
            </div>
            <div className="profile-detail">
              <span>Year of Study</span>
              <strong>{student.yearOfStudy ?? "—"}</strong>
            </div>
            <div className="profile-detail">
              <span>Student ID</span>
              <strong>{student.id ?? "—"}</strong>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // -----------------------------------------------------
  // MARKS
  // -----------------------------------------------------
  const renderMarks = () => {
    const totalMarks = marks.reduce(
      (sum, mark) => sum + Number(mark.marksObtained || 0),
      0
    );

    const totalMaxMarks = marks.reduce(
      (sum, mark) => sum + Number(mark.maxMarks || 0),
      0
    );

    const average =
      totalMaxMarks > 0
        ? Math.round((totalMarks / totalMaxMarks) * 100)
        : 0;

    return (
      <div className="marks-page">
        <div className="marks-summary">
          <div className="marks-summary-card purple">
            <span>📚</span>
            <div>
              <p>Total Assessments</p>
              <h2>{marks.length}</h2>
            </div>
          </div>

          <div className="marks-summary-card green">
            <span>🏆</span>
            <div>
              <p>Average Score</p>
              <h2>{average}%</h2>
            </div>
          </div>

          <div className="marks-summary-card blue">
            <span>⭐</span>
            <div>
              <p>Total Marks</p>
              <h2>{totalMarks}/{totalMaxMarks}</h2>
            </div>
          </div>
        </div>

        <div className="marks-card">
          <div className="marks-card-header">
            <div>
              <h2>📝 Marks & Results</h2>
              <p>Your academic assessment performance</p>
            </div>
            <div className="result-badge">
              {marks.length === 0
                ? "No results"
                : average >= 75
                  ? "Excellent"
                  : average >= 50
                    ? "Good"
                    : "Needs Improvement"}
            </div>
          </div>

          {loadingMarks ? (
            <div className="marks-loading">
              <div className="loader" />
              <p>Loading your marks...</p>
            </div>
          ) : marks.length === 0 ? (
            <div className="empty-marks">
              <div className="empty-icon">📊</div>
              <h3>No marks available</h3>
              <p>Your marks and semester results will appear here.</p>
            </div>
          ) : (
            <div className="marks-table-wrapper">
              <table className="marks-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Course Code</th>
                    <th>Assessment</th>
                    <th>Marks</th>
                    <th>Percentage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {marks.map((mark, index) => {
                    const maximum = Number(mark.maxMarks) || 0;
                    const obtained = Number(mark.marksObtained) || 0;
                    const percentage =
                      maximum > 0
                        ? Math.round((obtained / maximum) * 100)
                        : 0;

                    return (
                      <tr key={mark.id || index}>
                        <td>
                          <div className="course-name">
                            <div className="course-icon">📘</div>
                            <strong>{mark.courseName || "Course"}</strong>
                          </div>
                        </td>
                        <td>
                          <span className="course-code">
                            {mark.courseCode || "—"}
                          </span>
                        </td>
                        <td>{mark.assessment || "Assessment"}</td>
                        <td>
                          <strong>{obtained} / {maximum}</strong>
                        </td>
                        <td>
                          <div className="percentage-cell">
                            <div className="small-progress">
                              <div
                                className="small-progress-fill"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span>{percentage}%</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={
                              percentage >= 75
                                ? "status-badge success"
                                : percentage >= 50
                                  ? "status-badge warning"
                                  : "status-badge danger"
                            }
                          >
                            {percentage >= 75
                              ? "Excellent"
                              : percentage >= 50
                                ? "Good"
                                : "Improve"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // -----------------------------------------------------
  // TIMETABLE
  // -----------------------------------------------------
  const renderTimetable = () => (
    <div className="content-card">
      <div className="section-title">
        <div>
          <h2>📅 Weekly Timetable</h2>
          <p>Your upcoming academic schedule</p>
        </div>
      </div>

      {loadingTimetable ? (
        <div className="marks-loading">
          <div className="loader" />
          <p>Loading timetable...</p>
        </div>
      ) : timetable.length === 0 ? (
        <div className="empty-marks">
          <div className="empty-icon">📅</div>
          <h3>Timetable not uploaded yet</h3>
          <p>Your teacher or administrator will upload it here.</p>
        </div>
      ) : (
        <div className="timetable-grid">
          {timetable.map((item, index) => (
            <div className="timetable-item" key={item.id || index}>
              <div className="day-pill">{item.day || "Day"}</div>
              <div className="time">
                {item.startTime || item.time || "--"}
                {item.endTime ? ` - ${item.endTime}` : ""}
              </div>
              <div className="subject">
                <strong>{item.courseName || item.subject || "Course"}</strong>
                <span>
                  {item.courseCode ? `${item.courseCode} • ` : ""}
                  {item.room || "Room not assigned"}
                  {" • "}
                  {item.teacher || "Teacher not assigned"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // -----------------------------------------------------
  // AI ASSISTANT
  // -----------------------------------------------------
  const sendAIMessage = async () => {
    const message = aiInput.trim();

    if (!message || aiLoading) return;

    if (!student) {
      setAiMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: "Your student profile is not available yet. Please check your login and profile.",
        },
      ]);
      return;
    }

    setAiMessages((previous) => [
      ...previous,
      { role: "user", text: message },
    ]);

    setAiInput("");
    setAiLoading(true);

    try {
      const marksContext = marks.length
        ? marks.map((mark) => {
            const obtained = Number(mark.marksObtained || 0);
            const maximum = Number(mark.maxMarks || 0);
            const percentage =
              maximum > 0
                ? Math.round((obtained / maximum) * 100)
                : 0;

            return `${mark.courseName || "Course"} (${mark.courseCode || "N/A"}) - ${mark.assessment || "Assessment"}: ${obtained}/${maximum} (${percentage}%)`;
          }).join("\n")
        : "No marks available yet.";

      const timetableContext = timetable.length
        ? timetable.map((item) =>
            `${item.day || "Day"} | ${item.startTime || item.time || "--"}${item.endTime ? ` - ${item.endTime}` : ""} | ${item.courseName || item.subject || "Course"} | ${item.room || "Room not assigned"} | ${item.teacher || "Teacher not assigned"}`
          ).join("\n")
        : "No timetable available yet.";

      const coursesContext = courses.length
        ? courses.map((course) =>
            `${course.name || course.courseName || "Course"} (${course.code || course.courseCode || "N/A"})${course.credits ? ` - Credits: ${course.credits}` : ""}${course.progress != null ? ` - Progress: ${course.progress}%` : ""}`
          ).join("\n")
        : "No course data available.";

      const studentContext = `
Student name: ${student.name || "Student"}
Department: ${student.department || "Not available"}
Year of study: ${student.yearOfStudy ?? "Not available"}
Student ID: ${student.id ?? "Not available"}

COURSES:
${coursesContext}

MARKS:
${marksContext}

TIMETABLE:
${timetableContext}
      `.trim();

      const conversationHistory = aiMessages
        .slice(-10)
        .map((item) => ({
          role: item.role === "assistant" ? "assistant" : "user",
          text: item.text || "",
        }))
        .filter((item) => item.text.trim() !== "");

      const response = await fetch(
        "http://localhost:8080/api/ai/chat",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            studentContext,
            conversationHistory,
          }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message || `AI request failed (HTTP ${response.status}).`
        );
      }

      const reply =
        result?.response ||
        result?.message ||
        result?.text ||
        result?.reply;

      if (!reply) {
        throw new Error("The AI service returned an empty response.");
      }

      setAiMessages((previous) => [
        ...previous,
        { role: "assistant", text: reply },
      ]);
    } catch (error) {
      console.error("AI Assistant Error:", error);

      setAiMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: `AI Assistant: ${error.message || "Could not get a response."}`,
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendAIMessage();
    }
  };

  const clearAIChat = () => {
    setAiMessages([
      {
        role: "assistant",
        text: "Chat cleared. Hi again! 👋 Ask me about your studies, courses, marks, attendance, or academic planning.",
      },
    ]);
  };

  // -----------------------------------------------------
  // AI PAGE
  // -----------------------------------------------------
  const renderAI = () => (
    <div
      className="ai-page"
      style={{ display: "flex", flexDirection: "column", gap: 18 }}
    >
      <div
        className="ai-card"
        style={{
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          padding: 28,
          boxSizing: "border-box",
        }}
      >
        <div className="ai-icon">🤖</div>
        <h2>IntelliCampus AI Assistant</h2>
        <p>
          Your intelligent academic companion for study planning,
          performance analysis, and personalized recommendations.
        </p>
        <div className="ai-features">
          <div>📊 <strong>Performance Analysis</strong></div>
          <div>📚 <strong>Study Recommendations</strong></div>
          <div>🎯 <strong>Academic Guidance</strong></div>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 18,
          boxShadow: "0 8px 30px rgba(15, 23, 42, 0.08)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 520,
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <strong style={{ display: "block", fontSize: 17, color: "#111827" }}>
              💬 Academic Chat
            </strong>
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              Ask your AI academic companion
            </span>
          </div>

          <button
            type="button"
            onClick={clearAIChat}
            disabled={aiLoading}
            style={{
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
              color: "#374151",
              borderRadius: 9,
              padding: "8px 12px",
              cursor: aiLoading ? "not-allowed" : "pointer",
              fontSize: 13,
            }}
          >
            Clear chat
          </button>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 320,
            maxHeight: 430,
            overflowY: "auto",
            padding: 20,
            background: "#f8fafc",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {aiMessages.map((item, index) => {
            const isUser = item.role === "user";

            return (
              <div
                key={`${item.role}-${index}`}
                style={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "12px 15px",
                    borderRadius: isUser
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                    background: isUser ? "#4f46e5" : "#ffffff",
                    color: isUser ? "#ffffff" : "#1f2937",
                    border: isUser ? "none" : "1px solid #e5e7eb",
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.05)",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.55,
                    fontSize: 14,
                  }}
                >
                  {item.text}
                </div>
              </div>
            );
          })}

          {aiLoading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "12px 15px",
                  borderRadius: "16px 16px 16px 4px",
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  color: "#6b7280",
                  fontSize: 14,
                }}
              >
                🤖 Generating your answer...
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            padding: 14,
            borderTop: "1px solid #e5e7eb",
            background: "#ffffff",
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea
              value={aiInput}
              onChange={(event) => setAiInput(event.target.value)}
              onKeyDown={handleAIKeyDown}
              placeholder="Ask me about your studies..."
              rows={2}
              disabled={aiLoading}
              style={{
                flex: 1,
                resize: "none",
                border: "1px solid #d1d5db",
                borderRadius: 12,
                padding: "11px 13px",
                outline: "none",
                fontFamily: "inherit",
                fontSize: 14,
                color: "#111827",
                background: aiLoading ? "#f3f4f6" : "#ffffff",
                boxSizing: "border-box",
              }}
            />

            <button
              type="button"
              onClick={sendAIMessage}
              disabled={aiLoading || !aiInput.trim()}
              style={{
                minWidth: 100,
                height: 48,
                border: "none",
                borderRadius: 12,
                background:
                  aiLoading || !aiInput.trim() ? "#c7d2fe" : "#4f46e5",
                color: "#ffffff",
                fontWeight: 600,
                cursor:
                  aiLoading || !aiInput.trim() ? "not-allowed" : "pointer",
              }}
            >
              {aiLoading ? "Sending..." : "Send ➤"}
            </button>
          </div>

          <p style={{ margin: "8px 2px 0", fontSize: 12, color: "#9ca3af" }}>
            Press Enter to send • Shift + Enter for a new line
          </p>
        </div>
      </div>
    </div>
  );

  // -----------------------------------------------------
  // PAGE CONTENT
  // -----------------------------------------------------
  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return renderDashboard();
      case "Profile":
        return renderProfile();
      case "Courses":
        return <Courses />;
      case "Attendance":
        return <Attendance />;
      case "Marks":
        return <Marks />;
      case "Timetable":
        return renderTimetable();
      case "AI":
        return renderAI();
      default:
        return renderDashboard();
    }
  };

  // -----------------------------------------------------
  // STUDENT PORTAL
  // -----------------------------------------------------
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">🎓 IntelliCampus</div>

        <nav className="sidebar-nav">
          {[
            { id: "Dashboard", icon: "🏠", label: "Dashboard" },
            { id: "Profile", icon: "👤", label: "My Profile" },
            { id: "Courses", icon: "📚", label: "My Courses" },
            { id: "Attendance", icon: "📊", label: "Attendance" },
            { id: "Marks", icon: "📝", label: "Marks & Results" },
            { id: "Timetable", icon: "📅", label: "Timetable" },
            { id: "AI", icon: "🤖", label: "AI Assistant" },
          ].map((page) => (
            <button
              key={page.id}
              className={
                activePage === page.id
                  ? "nav-button active"
                  : "nav-button"
              }
              onClick={() => setActivePage(page.id)}
            >
              {page.icon}
              <span>{page.label}</span>
            </button>
          ))}
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          🚪 <span>Logout</span>
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>{getPageTitle()}</h1>
            <p>Student Portal</p>
          </div>

          <div className="student-badge">
            👤 {student?.name || user?.name || user?.email || "Student"}
          </div>
        </header>

        <section className="page-content">{renderPage()}</section>
      </main>
    </div>
  );
}

export default StudentDashboard;