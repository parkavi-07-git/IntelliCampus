import { useEffect, useState } from "react";

const API = "http://localhost:8080/api/marks";

function Marks() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMarks() {
      try {
        const response = await fetch(API, {
          credentials: "include"
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Session expired. Please log in again.");
          }
          if (response.status === 403) {
            throw new Error("Please log in using your student account.");
          }
          throw new Error("Unable to load marks.");
        }

        const data = await response.json();
        setMarks(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Could not connect to the backend.");
      } finally {
        setLoading(false);
      }
    }

    loadMarks();
  }, []);

  const getValue = (item, keys, fallback = "—") => {
    for (const key of keys) {
      if (item[key] !== undefined && item[key] !== null && item[key] !== "") {
        return item[key];
      }
    }
    return fallback;
  };

  const getScore = (item) =>
    getValue(item, ["marksObtained", "obtainedMarks", "marks", "score", "mark"]);

  const getTotal = (item) =>
    getValue(item, ["totalMarks", "maximumMarks", "maxMarks", "outOf"]);

  const getSubject = (item) =>
    getValue(item, ["courseName", "subjectName", "subject", "courseCode", "title"], "Subject");

  const getPercentage = (item) => {
    const score = Number(getScore(item));
    const total = Number(getTotal(item));

    if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) {
      return null;
    }

    return `${((score / total) * 100).toFixed(1)}%`;
  };

  return (
    <div style={{ padding: "24px", color: "var(--text-color, #1f2937)" }}>
      <h1>📝 Marks &amp; Results</h1>
      <p>View your academic marks and results.</p>

      {loading && <p>Loading your marks...</p>}

      {error && (
        <div role="alert" style={{ padding: 16, borderRadius: 10, background: "#fee2e2", color: "#991b1b" }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div style={{ margin: "20px 0", padding: 18, borderRadius: 12, background: "#eef2ff" }}>
            <strong style={{ fontSize: 28, color: "#4338ca" }}>{marks.length}</strong>
            <div>Results available</div>
          </div>

          {marks.length === 0 ? (
            <div style={{ padding: 24, border: "1px solid #e5e7eb", borderRadius: 12 }}>
              <h3>No marks available yet</h3>
              <p>Your marks will appear here when your teacher adds them.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr>
                    {["Subject", "Marks", "Total", "Percentage", "Exam / Assessment"].map((heading) => (
                      <th key={heading} style={{ padding: 12, borderBottom: "2px solid #d1d5db" }}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {marks.map((item, index) => (
                    <tr key={item.id ?? index}>
                      <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                        <strong>{getSubject(item)}</strong>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          {getValue(item, ["courseCode", "subjectCode"], "")}
                        </div>
                      </td>
                      <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                        {getScore(item)}
                      </td>
                      <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                        {getTotal(item)}
                      </td>
                      <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                        {getPercentage(item) ?? "—"}
                      </td>
                      <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                        {getValue(item, ["examName", "assessmentName", "examType", "assessment", "title"])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Marks;
