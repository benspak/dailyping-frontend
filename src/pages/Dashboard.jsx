import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminPanel from "../components/AdminPanel";
import { registerPush } from "../utils/registerPush";
import { useAuth } from "../context/AuthContext";
import md5 from "md5";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [responses, setResponses] = useState([]);
  const [taskState, setTaskState] = useState({});
  const [activeAccordion, setActiveAccordion] = useState(null);

  useEffect(() => {
    if (!user) return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.action === "play-ping-sound") {
          const audio = new Audio("/Done.mp3");
          audio.play().catch((err) => console.warn("Unable to autoplay sound:", err));
        }
      });
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://api.dailyping.org/api/responses/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setResponses(res.data);

        const updatedTaskState = {};
        res.data.forEach((r) => {
          updatedTaskState[r._id] = { goalCompleted: r.completed || false };
          r.subTasks?.forEach((t, i) => {
            updatedTaskState[r._id][i] = t.completed;
          });
        });
        setTaskState(updatedTaskState);

        await registerPush();
      } catch {
        setResponses([]);
      }
    };

    fetchData();
  }, [user]);

  const toggleTask = async (responseId, index) => {
    const token = localStorage.getItem("token");

    const updated = {
      ...taskState,
      [responseId]: {
        ...(taskState[responseId] || {}),
        [index]: !taskState[responseId]?.[index],
      },
    };
    setTaskState(updated);

    try {
      if (index === "goalCompleted") {
        await axios.post(
          "https://api.dailyping.org/api/response/toggle-goal",
          { responseId, completed: updated[responseId][index] },
          { headers: { Authorization: `Bearer ${token}` } }
        );

         // ✅ Update the local response object
          setResponses(prev =>
            prev.map(r =>
              r._id === responseId ? { ...r, completed: updated[responseId][index] } : r
            )
          );
      } else {
        await axios.post(
          "https://api.dailyping.org/api/response/toggle-subtask",
          { responseId, index, completed: updated[responseId][index] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      console.error("❌ Failed to update task:", err);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <p>Please log in to view your dashboard.</p>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="card shadow-sm p-4 mb-4">
        <div className="row align-items-center">
          <div className="col-md-auto text-center mb-3 mb-md-0">
            <img
              src={`https://www.gravatar.com/avatar/${md5(user.email?.trim().toLowerCase())}?s=80&d=identicon`}
              alt="User Avatar"
              className="rounded-circle"
              width="80"
              height="80"
            />
          </div>
          <div className="col-md">
            <h5 className="fw-bold mb-1">Welcome, {user.email}</h5>
            <p className="text-muted mb-0">Track your goals, check off subtasks, and keep your streak alive.</p>
          </div>
          <div className="col-md-auto text-center mt-3 mt-md-0">
            <div className="mb-2">
              <p className="mb-1 fw-bold text-muted">Current Streak</p>
              <span className="badge bg-success fs-6">{user.streak?.current ?? 0} days</span>
            </div>
            <div>
              <p className="mb-1 fw-bold text-muted">Pro Status</p>
              <span className={`badge fs-6 ${user.pro ? "bg-primary" : "bg-secondary"}`}>
                {user.pro ? "✅ Active" : "❌ Not active"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pro CTA */}
      {!user.pro && (
        <div className="alert alert-warning text-center mb-4">
          <h5 className="mb-2">⭐ Unlock Pro</h5>
          <p>Customize your ping time, choose a tone, get weekly reports & more.</p>
          <button
            className="btn btn-primary btn-sm"
            onClick={async () => {
              const token = localStorage.getItem("token");
              const res = await axios.post(
                "https://api.dailyping.org/billing/create-checkout-session",
                {},
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              window.location.href = res.data.url;
            }}
          >
            Go Pro for $5/month
          </button>
        </div>
      )}

      {/* Goals */}
      <h4 className="mb-3">Your Past Goals</h4>
      {responses.length === 0 ? (
        <p className="text-muted">No responses yet.</p>
      ) : (
        <div className="accordion" id="goalsAccordion">
          {responses.map((r, index) => (
            <div
              className={`accordion-item ${r.date === today ? "border-primary border-2" : ""}`}
              key={r._id}
            >
              <h2 className="accordion-header" id={`heading-${r._id}`}>
                <div className="d-flex align-items-center w-100">
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={taskState[r._id]?.goalCompleted || false}
                    onChange={() => toggleTask(r._id, "goalCompleted")}
                  />
                  <button
                    className={`accordion-button ${activeAccordion === index ? "" : "collapsed"}`}
                    type="button"
                    onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                  >
                    <strong>{r.date}</strong>: {r.content}
                    {r.date === today && <span className="badge bg-info ms-3">Today</span>}
                  </button>
                </div>
              </h2>
              <div
                id={`collapse-${r._id}`}
                className={`accordion-collapse collapse ${activeAccordion === index ? "show" : ""}`}
              >
                <div className="accordion-body">
                  {(r.subTasks || []).map((task, idx) => (
                    task.text && (
                      <div className="form-check mb-2" key={idx}>
                        <input
                          className="form-check-input me-2"
                          type="checkbox"
                          id={`task-${r._id}-${idx}`}
                          checked={taskState[r._id]?.[idx] || false}
                          onChange={() => toggleTask(r._id, idx)}
                        />
                        <label className="form-check-label" htmlFor={`task-${r._id}-${idx}`}>
                          {task.text}
                        </label>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin */}
      {user.isAdmin && (
        <div className="mt-5">
          <AdminPanel />
        </div>
      )}
    </div>
  );
}
