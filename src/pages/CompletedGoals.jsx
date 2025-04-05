import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import md5 from "md5";

export default function CompletedGoals() {
  const { user, loading } = useAuth();
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    const fetchCompleted = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://api.dailyping.org/api/responses/all", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const completed = res.data.filter(r => r.completed);
        setResponses(completed);
      } catch {
        setResponses([]);
      }
    };

    if (user) {
      fetchCompleted();
    }
  }, [user]);

  if (loading) return <div className="container py-5 text-center"><div className="spinner-border" /></div>;
  if (!user) return <div className="container py-5 text-center">Please log in to view this page.</div>;

  return (
    <div className="container py-5">
      <h3 className="mb-4 text-center">🎯 Completed Goals</h3>
      {responses.length === 0 ? (
        <p className="text-muted">No completed goals yet.</p>
      ) : (
        <ul className="list-group">
          {responses.map((r) => (
            <li key={r._id} className="list-group-item">
              <strong>{r.date}</strong>: <s>{r.content}</s>
              <ul className="mt-2">
                {(r.subTasks || []).map((t, idx) => (
                  <li key={idx} style={{ color: t.completed ? "#6c757d" : "#000" }}>
                    {t.completed ? <s>{t.text}</s> : t.text}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
