
import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

const API = "http://localhost:8080";

function AdminDashboard({ user, onLogout }) {
  const [teachers, setTeachers] = useState([]);
  const exportTeachersCSV = () => {
  if (!teachers.length) {
    alert("No teacher records available to export.");
    return;
  }

  const headers = [
    "Name",
    "Email",
    "Email Verification",
    "Approval Status",
  ];

  const escapeCSV = (value) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const rows = teachers.map((teacher) => [
    teacher.name,
    teacher.email,
    teacher.emailVerified ? "Verified" : "Not Verified",
    teacher.approved ? "Approved" : "Pending",
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "intellicampus-teacher-report.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadTeachers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/api/admin/teachers`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load teachers.");
      }

      setTeachers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const updateApproval = async (teacherId, approved) => {
    setUpdatingId(teacherId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API}/api/admin/teachers/${teacherId}/approval`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ approved }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update approval.");
      }

      setMessage(data.message || "Teacher approval updated successfully.");
      await loadTeachers();
    } catch (err) {
      setError(err.message || "Could not update teacher approval.");
    } finally {
      setUpdatingId(null);
    }
  };

  const approvedCount = teachers.filter((teacher) => teacher.approved).length;
  const pendingCount = teachers.length - approvedCount;

  return (
    <main className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <div className="admin-brand">
            <div className="admin-logo">IC</div>
            <div>
              <p className="admin-eyebrow">INTELLICAMPUS</p>
              <h1>Admin Control Center</h1>
              <p className="admin-subtitle">
                Manage teacher access and monitor account approvals.
              </p>
            </div>
          </div>

          <button className="admin-logout" onClick={onLogout}>
            <span aria-hidden="true">↪</span> Logout
          </button>
        </header>

        <section className="admin-welcome">
          <div>
            <p className="admin-eyebrow">ADMINISTRATOR</p>
            <h2>Welcome, {user?.name || "Admin"} 👋</h2>
            <p>
              {user?.email || "Admin account"} · {user?.role || "ADMIN"}
            </p>
          </div>
          <div className="admin-access-badge">
            <span className="admin-status-dot" />
            Admin Access
          </div>
        </section>

        <section className="admin-stats" aria-label="Teacher statistics">
          <article className="admin-stat-card">
            <div className="admin-stat-top">
              <span className="admin-stat-label">Total Teachers</span>
              <span className="admin-stat-icon purple">♙</span>
            </div>
            <strong className="admin-stat-number">
              {loading ? "—" : teachers.length}
            </strong>
            <p>Registered teacher accounts</p>
          </article>

          <article className="admin-stat-card">
            <div className="admin-stat-top">
              <span className="admin-stat-label">Approved Teachers</span>
              <span className="admin-stat-icon green">✓</span>
            </div>
            <strong className="admin-stat-number green-text">
              {loading ? "—" : approvedCount}
            </strong>
            <p>Teachers approved for access</p>
          </article>

          <article className="admin-stat-card">
            <div className="admin-stat-top">
              <span className="admin-stat-label">Pending Approval</span>
              <span className="admin-stat-icon orange">◷</span>
            </div>
            <strong className="admin-stat-number orange-text">
              {loading ? "—" : pendingCount}
            </strong>
            <p>Accounts awaiting approval</p>
          </article>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <p className="admin-eyebrow">ACCOUNT MANAGEMENT</p>
              <h2>Teacher Approval Management</h2>
              <p className="admin-subtitle">
                Review teacher details and manage platform access.
              </p>
            </div>

          
<button
  className="admin-refresh"
  onClick={loadTeachers}
  disabled={loading}
>
  <span aria-hidden="true">↻</span>
  {loading ? "Loading..." : "Refresh"}
</button>

<button
  className="admin-refresh"
  onClick={exportTeachersCSV}
  disabled={loading || teachers.length === 0}
>
  ⬇ Export CSV
</button>

          </div>

          {message && (
            <div className="admin-alert success" role="status">
              ✓ {message}
            </div>
          )}

          {error && (
            <div className="admin-alert error" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="admin-state">
              <div className="admin-spinner" />
              <p>Loading teacher accounts...</p>
            </div>
          ) : teachers.length === 0 && !error ? (
            <div className="admin-state">
              <div className="admin-empty-icon">♙</div>
              <h3>No teacher accounts found</h3>
              <p>Teacher accounts will appear here when available.</p>
            </div>
          ) : teachers.length > 0 ? (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Teacher</th>
                    <th>Email Verification</th>
                    <th>Approval Status</th>
                    <th className="admin-action-heading">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {teachers.map((teacher) => (
                    <tr key={teacher.id}>
                      <td>
                        <div className="admin-teacher">
                          <div className="admin-avatar">
                            {(teacher.name || "T").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{teacher.name || "Unnamed Teacher"}</strong>
                            <span>{teacher.email || "No email available"}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`admin-pill ${
                            teacher.emailVerified ? "verified" : "unverified"
                          }`}
                        >
                          <span className="admin-status-dot" />
                          {teacher.emailVerified ? "Verified" : "Not verified"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`admin-pill ${
                            teacher.approved ? "approved" : "pending"
                          }`}
                        >
                          <span className="admin-status-dot" />
                          {teacher.approved ? "Approved" : "Pending"}
                        </span>
                      </td>

                      <td className="admin-action-cell">
                        <button
                          className={`admin-action-button ${
                            teacher.approved ? "revoke" : "approve"
                          }`}
                          disabled={updatingId === teacher.id}
                          onClick={() =>
                            updateApproval(teacher.id, !teacher.approved)
                          }
                        >
                          {updatingId === teacher.id
                            ? "Updating..."
                            : teacher.approved
                            ? "Revoke Approval"
                            : "Approve Teacher"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <footer className="admin-panel-footer">
            <span>
              Showing {loading ? "—" : teachers.length} teacher account
              {teachers.length === 1 ? "" : "s"}
            </span>
            <span>Email verification and teacher approval are separate.</span>
          </footer>
        </section>

        <footer className="admin-page-footer">
          IntelliCampus · Smart Academic Management System
        </footer>
      </div>
    </main>
  );
}

export default AdminDashboard;
