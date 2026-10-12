import { useState } from "react";
import "./TeacherLogin.css";

function TeacherLogin() {
  const [username, setUsername] = useState("teacher");
  const [password, setPassword] = useState("teacher123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/teacher-login",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Invalid teacher username or password."
        );

        setLoading(false);
        return;
      }

      // Separate teacher session
      localStorage.setItem(
        "teacherSession",
        JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
        })
      );

      // Go to separate teacher dashboard
      window.location.href = "/teacher-dashboard";
    } catch (error) {
      console.error("Teacher Login Error:", error);

      setError(
        "Cannot connect to backend. Please make sure Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const goToStudentPortal = () => {
    window.location.href = "/";
  };

  return (
    <div className="teacher-login-page">

      <div className="teacher-login-card">

        <div className="teacher-logo">
          👨‍🏫
        </div>

        <h1>IntelliCampus</h1>

        <h2>Teacher / Admin Login</h2>

        <p className="teacher-subtitle">
          Secure access to the management portal
        </p>

        <form onSubmit={handleLogin}>

          <div className="teacher-input-group">

            <label>Username</label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              placeholder="Enter username"
              required
            />

          </div>

          <div className="teacher-input-group">

            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter password"
              required
            />

          </div>

          {error && (
            <div className="teacher-error">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="teacher-login-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login to Management Portal →"}
          </button>

        </form>

        <button
          className="back-student-button"
          onClick={goToStudentPortal}
        >
          ← Back to Student Portal
        </button>

        <div className="demo-login">

          <h3>Demo Login</h3>

          <p>
            Username: <strong>teacher</strong>
          </p>

          <p>
            Password: <strong>teacher123</strong>
          </p>

        </div>

      </div>

    </div>
  );
}

export default TeacherLogin;