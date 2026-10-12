import { useState } from "react";

import LoginPage from "./LoginPage";
import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const role = user.role?.toUpperCase();

  if (role === "STUDENT") {
    return (
      <StudentDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  if (role === "TEACHER") {
    return (
      <TeacherDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  if (role === "ADMIN") {
    return (
      <AdminDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  return <LoginPage onLogin={handleLogin} />;
}

export default App;