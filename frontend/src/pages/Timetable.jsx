
import { useEffect, useState } from "react";

const API = "http://localhost:8080/api";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Timetable() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`${API}/timetable`, {
          credentials: "include",
        });

        if (!response.ok) throw new Error("Unable to load timetable.");

        setItems(await response.json());
      } catch (err) {
        setError(err.message);
      }
    }

    load();
  }, []);

  const sortedItems = [...items].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  return (
    <main style={{ padding: 24 }}>
      <h1>My Timetable</h1>
      <p>View the latest timetable published by your teacher.</p>

      {error && <p role="alert">{error}</p>}

      {days.map(day => {
        const classes = sortedItems.filter(item => item.day === day);

        if (classes.length === 0) return null;

        return (
          <section key={day} style={{ marginBottom: 24 }}>
            <h2>{day}</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: 10 }}>Time</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Course</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Teacher</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Room</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map(item => (
                    <tr key={item.id}>
                      <td style={{ padding: 10 }}>
                        {item.startTime} – {item.endTime}
                      </td>
                      <td style={{ padding: 10 }}>
                        {item.courseName} ({item.courseCode})
                      </td>
                      <td style={{ padding: 10 }}>{item.teacher}</td>
                      <td style={{ padding: 10 }}>{item.room || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      {!error && items.length === 0 && (
        <p>Your teacher has not published a timetable yet.</p>
      )}
    </main>
  );
}
