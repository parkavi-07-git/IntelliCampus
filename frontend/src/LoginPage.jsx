import { useState } from "react";

function LoginPage({ onLogin }) {
  const [role, setRole] = useState("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint =
        role === "STUDENT"
          ? "/api/auth/login"
          : role === "TEACHER"
          ? "/api/auth/teacher-login"
          : "/api/auth/admin-login";

      const response = await fetch(
        `http://localhost:8080${endpoint}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid login details");
      }

      if (data.role?.toUpperCase() !== role) {
        throw new Error("This account does not match the selected role.");
      }

      onLogin(data);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    setEmail("");
    setPassword("");
    setError("");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🎓</div>

        <h1>IntelliCampus</h1>
        <p className="login-subtitle">
          Intelligent Student Campus Platform
        </p>

        <div className="role-selector">
          {[
            { value: "STUDENT", label: "🎓 Student" },
            { value: "TEACHER", label: "🧑‍🏫 Teacher" },
            { value: "ADMIN", label: "🧑‍💼 Admin" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              className={
                role === item.value
                  ? "role-button active"
                  : "role-button"
              }
              onClick={() => selectRole(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="login-heading">
          <h2>
            {role === "STUDENT"
              ? "Student Login"
              : role === "TEACHER"
              ? "Teacher Login"
              : "Admin Login"}
          </h2>

          <p>
            {role === "STUDENT"
              ? "Access your academic dashboard"
              : role === "TEACHER"
              ? "Manage students and academic activities"
              : "Manage the IntelliCampus platform"}
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder={
                role === "STUDENT"
                  ? "student@intellicampus.com"
                  : role === "TEACHER"
                  ? "teacher@intellicampus.com"
                  : "admin@intellicampus.com"
              }
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="login-error" role="alert">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : `Login as ${
                  role.charAt(0) + role.slice(1).toLowerCase()
                } →`}
          </button>
        </form>

        <div className="demo-box">
          <h3>Secure Campus Access</h3>
          <p>Use the email and password assigned to your account.</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;