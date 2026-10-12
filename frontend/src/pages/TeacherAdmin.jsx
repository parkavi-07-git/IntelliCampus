import { useState } from "react";
import "./TeacherAdmin.css";

function TeacherAdmin() {
  const [activePage, setActivePage] = useState("Dashboard");

  const handleLogout = () => {
    sessionStorage.removeItem("teacherLoggedIn");
    sessionStorage.removeItem("teacherUser");

    window.location.href = "/teacher-login";
  };

  return (
    <div className="teacher-app">

      {/* SIDEBAR */}

      <aside className="teacher-sidebar">

        <div className="teacher-logo">
          <div className="teacher-logo-icon">🎓</div>

          <div>
            <h2>IntelliCampus</h2>
            <span>Management Portal</span>
          </div>
        </div>

        <nav className="teacher-nav">

          <button
            className={
              activePage === "Dashboard"
                ? "teacher-nav-item active"
                : "teacher-nav-item"
            }
            onClick={() => setActivePage("Dashboard")}
          >
            📊
            <span>Dashboard</span>
          </button>

          <button
            className={
              activePage === "Students"
                ? "teacher-nav-item active"
                : "teacher-nav-item"
            }
            onClick={() => setActivePage("Students")}
          >
            👨‍🎓
            <span>Students</span>
          </button>

          <button
            className={
              activePage === "Courses"
                ? "teacher-nav-item active"
                : "teacher-nav-item"
            }
            onClick={() => setActivePage("Courses")}
          >
            📚
            <span>Courses</span>
          </button>

          <button
            className={
              activePage === "Attendance"
                ? "teacher-nav-item active"
                : "teacher-nav-item"
            }
            onClick={() => setActivePage("Attendance")}
          >
            📝
            <span>Attendance</span>
          </button>

          <button
            className={
              activePage === "Marks"
                ? "teacher-nav-item active"
                : "teacher-nav-item"
            }
            onClick={() => setActivePage("Marks")}
          >
            🏆
            <span>Marks & Results</span>
          </button>

          <button
            className={
              activePage === "Timetable"
                ? "teacher-nav-item active"
                : "teacher-nav-item"
            }
            onClick={() => setActivePage("Timetable")}
          >
            📅
            <span>Timetable</span>
          </button>

        </nav>

        <button
          className="teacher-logout"
          onClick={handleLogout}
        >
          🚪
          <span>Logout</span>
        </button>

      </aside>

      {/* MAIN */}

      <main className="teacher-main">

        <header className="teacher-topbar">

          <div>
            <h1>
              {activePage === "Dashboard"
                ? "Teacher Dashboard"
                : activePage}
            </h1>

            <p>
              Manage your academic operations
            </p>
          </div>

          <div className="teacher-profile">

            <div className="teacher-avatar">
              👨‍🏫
            </div>

            <div>
              <strong>Teacher</strong>
              <span>Administrator</span>
            </div>

          </div>

        </header>

        <section className="teacher-content">

          {activePage === "Dashboard" && (

            <>

              <div className="teacher-welcome">

                <div>
                  <span>👋 Welcome back!</span>

                  <h2>
                    Manage IntelliCampus
                  </h2>

                  <p>
                    Monitor students, attendance,
                    courses and academic performance
                    from one place.
                  </p>
                </div>

                <div className="welcome-icon">
                  🎓
                </div>

              </div>

              <div className="teacher-stats">

                <div className="teacher-stat-card">
                  <div className="stat-icon purple">
                    👨‍🎓
                  </div>

                  <div>
                    <span>Total Students</span>
                    <strong>1</strong>
                  </div>
                </div>

                <div className="teacher-stat-card">
                  <div className="stat-icon blue">
                    📚
                  </div>

                  <div>
                    <span>Total Courses</span>
                    <strong>8</strong>
                  </div>
                </div>

                <div className="teacher-stat-card">
                  <div className="stat-icon green">
                    📊
                  </div>

                  <div>
                    <span>Average Attendance</span>
                    <strong>85%</strong>
                  </div>
                </div>

                <div className="teacher-stat-card">
                  <div className="stat-icon orange">
                    🏆
                  </div>

                  <div>
                    <span>Average Performance</span>
                    <strong>78%</strong>
                  </div>
                </div>

              </div>

              <div className="teacher-section-grid">

                <div className="teacher-panel">

                  <div className="panel-header">
                    <div>
                      <h3>📌 Quick Actions</h3>
                      <p>Frequently used management tools</p>
                    </div>
                  </div>

                  <div className="quick-actions">

                    <button
                      onClick={() =>
                        setActivePage("Students")
                      }
                    >
                      👨‍🎓
                      <span>
                        <strong>Manage Students</strong>
                        <small>
                          View student information
                        </small>
                      </span>
                    </button>

                    <button
                      onClick={() =>
                        setActivePage("Attendance")
                      }
                    >
                      📝
                      <span>
                        <strong>Mark Attendance</strong>
                        <small>
                          Record today's attendance
                        </small>
                      </span>
                    </button>

                    <button
                      onClick={() =>
                        setActivePage("Marks")
                      }
                    >
                      🏆
                      <span>
                        <strong>Enter Marks</strong>
                        <small>
                          Update student results
                        </small>
                      </span>
                    </button>

                    <button
                      onClick={() =>
                        setActivePage("Timetable")
                      }
                    >
                      📅
                      <span>
                        <strong>Manage Timetable</strong>
                        <small>
                          Update class schedule
                        </small>
                      </span>
                    </button>

                  </div>

                </div>

                <div className="teacher-panel">

                  <div className="panel-header">
                    <div>
                      <h3>📈 Today's Overview</h3>
                      <p>Academic activity summary</p>
                    </div>
                  </div>

                  <div className="overview-item">
                    <span>Attendance recorded</span>
                    <strong>85%</strong>
                  </div>

                  <div className="overview-item">
                    <span>Classes scheduled</span>
                    <strong>5</strong>
                  </div>

                  <div className="overview-item">
                    <span>Active courses</span>
                    <strong>8</strong>
                  </div>

                  <div className="overview-item">
                    <span>Pending tasks</span>
                    <strong>3</strong>
                  </div>

                </div>

              </div>

            </>

          )}

          {activePage !== "Dashboard" && (

            <div className="coming-soon">

              <div>🚀</div>

              <h2>
                {activePage}
              </h2>

              <p>
                This management module is ready
                for the next development step.
              </p>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default TeacherAdmin;