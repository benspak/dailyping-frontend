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
  const todayDate = new Date().toISOString().split("T")[0];

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

        const updatedState = {};
        res.data.forEach((r) => {
          updatedState[r._id] = { goalCompleted: r.completed || false };
          r.subTasks?.forEach((t, i) => {
            updatedState[r._id][i] = t.completed;
          });
        });

        setResponses(res.data);
        setTaskState(updatedState);
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

  const activeGoals = responses.filter((r) => !r.completed);
  const completedGoals = responses.filter((r) => r.completed);
  const todayGoal = activeGoals.find((r) => r.date === todayDate);
  const otherActiveGoals = activeGoals.filter((r) => r.date !== todayDate);

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
            <p className="text-muted mb-0">
              Track your goals, check off subtasks, and keep your streak alive.
            </p>
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
                { headers: { Authorization: `Bearer ${token}` } }
              );
              window.location.href = res.data.url;
            }}
          >
            Go Pro for $5/month
          </button>
        </div>
      )}

      {/* Active Goals */}
      <h4 className="mb-3">Your Active Goals</h4>
      {todayGoal && (
        <div className="accordion mb-4">
          <div className="accordion-item border border-success">
            <h2 className="accordion-header">
              <div className="d-flex align-items-center w-100 bg-success-subtle p-3">
                <span className={todayGoal.completed ? "text-decoration-line-through text-muted" : ""}>
                  <strong>{todayGoal.date}</strong>: {todayGoal.content}
                </span>
              </div>
            </h2>
            <div className="accordion-body">
              {(todayGoal.subTasks || []).map((task, idx) => (
                <div className="form-check mb-2" key={idx}>
                  <input
                    className="form-check-input me-2"
                    type="checkbox"
                    checked={taskState[todayGoal._id]?.[idx] || false}
                    onChange={() => toggleTask(todayGoal._id, idx)}
                  />
                  <label
                    className={`form-check-label ${
                      taskState[todayGoal._id]?.[idx] ? "text-decoration-line-through text-muted" : ""
                    }`}
                  >
                    {task.text}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {otherActiveGoals.length === 0 ? (
        <p className="text-muted">No additional active goals.</p>
      ) : (
        <div className="accordion mb-5" id="goalsAccordion">
          {otherActiveGoals.map((r, index) => (
            <div className="accordion-item" key={r._id}>
              <h2 className="accordion-header" id={`heading-${r._id}`}>
                <div className="d-flex align-items-center w-100">
                  <button
                    className={`accordion-button ${activeAccordion === index ? "" : "collapsed"}`}
                    type="button"
                    onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                  >
                    <span className={r.completed ? "text-decoration-line-through text-muted" : ""}>
                      <strong>{r.date}</strong>: {r.content}
                    </span>
                  </button>
                </div>
              </h2>
              <div
                id={`collapse-${r._id}`}
                className={`accordion-collapse collapse ${activeAccordion === index ? "show" : ""}`}
              >
                <div className="accordion-body">
                  {(r.subTasks || []).map((task, idx) => (
                    <div className="form-check mb-2" key={idx}>
                      <input
                        className="form-check-input me-2"
                        type="checkbox"
                        id={`task-${r._id}-${idx}`}
                        checked={taskState[r._id]?.[idx] || false}
                        onChange={() => toggleTask(r._id, idx)}
                      />
                      <label
                        className={`form-check-label ${
                          taskState[r._id]?.[idx] ? "text-decoration-line-through text-muted" : ""
                        }`}
                        htmlFor={`task-${r._id}-${idx}`}
                      >
                        {task.text}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <>
          <h4 className="mb-3">Completed Goals</h4>
          <ul className="list-group mb-5">
            {completedGoals.map((r) => (
              <li key={r._id} className="list-group-item text-muted text-decoration-line-through">
                <strong>{r.date}</strong>: {r.content}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Admin Panel */}
      {user.isAdmin && (
        <div className="mt-5">
          <AdminPanel />
        </div>
      )}
    </div>
  );
}
