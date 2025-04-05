import React, { useEffect, useState } from "react";
import axios from "axios";
import { registerPush } from "../utils/registerPush";
import { useAuth } from "../context/AuthContext";
import md5 from "md5";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [responses, setResponses] = useState([]);
  const [taskState, setTaskState] = useState({});
  const [activeWeeklyAccordion, setActiveWeeklyAccordion] = useState(null);
  const [activePastAccordion, setActivePastAccordion] = useState(null);
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

  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 6);
  const todayISO = today.toISOString().split("T")[0];
  const weekAgoISO = oneWeekAgo.toISOString().split("T")[0];

  const activeResponses = responses.filter((r) => !r.completed);
  const completedResponses = responses.filter((r) => r.completed);

  const todayGoal = activeResponses.find((r) => r.date === todayISO);
  const weeklyGoals = activeResponses.filter((r) => r.date > weekAgoISO && r.date < todayISO);
  const olderGoals = activeResponses.filter((r) => r.date <= weekAgoISO);

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

      {/* Today's Goal */}
      {todayGoal && (
        <>
          <h4 className="mb-3">Today's Goal</h4>
          <div className="card border-success mb-4">
            <div className="card-body">
              <h5 className="card-title">
                {todayGoal.completed ? (
                  <s className="text-muted">{todayGoal.content}</s>
                ) : (
                  todayGoal.content
                )}
              </h5>
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
        </>
      )}

      {/* Weekly Goals */}
      {weeklyGoals.length > 0 && (
        <>
          <h4 className="mb-3">This Week's Goals</h4>
          <div className="accordion mb-5" id="weeklyAccordion">
            {weeklyGoals.map((r, index) => (
              <div className="accordion-item" key={r._id}>
                <h2 className="accordion-header" id={`heading-week-${r._id}`}>
                  <button
                    className={`accordion-button ${activeWeeklyAccordion === index ? "" : "collapsed"}`}
                    type="button"
                    onClick={() =>
                      setActiveWeeklyAccordion(activeWeeklyAccordion === index ? null : index)
                    }
                  >
                    <strong>{r.date}</strong>: {r.content}
                  </button>
                </h2>
                <div
                  id={`collapse-week-${r._id}`}
                  className={`accordion-collapse collapse ${activeWeeklyAccordion === index ? "show" : ""}`}
                >
                  <div className="accordion-body">
                    {(r.subTasks || []).map((task, idx) => (
                      <div className="form-check mb-2" key={idx}>
                        <input
                          className="form-check-input me-2"
                          type="checkbox"
                          checked={taskState[r._id]?.[idx] || false}
                          onChange={() => toggleTask(r._id, idx)}
                          id={`task-${r._id}-${idx}`}
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
        </>
      )}

      {/* Older Goals */}
      {olderGoals.length > 0 && (
        <>
          <h4 className="mb-3">Your Past Goals</h4>
          <div className="accordion mb-5" id="pastAccordion">
            {olderGoals.map((r, index) => (
              <div className="accordion-item" key={r._id}>
                <h2 className="accordion-header" id={`heading-past-${r._id}`}>
                  <button
                    className={`accordion-button ${activePastAccordion === index ? "" : "collapsed"}`}
                    type="button"
                    onClick={() =>
                      setActivePastAccordion(activePastAccordion === index ? null : index)
                    }
                  >
                    <strong>{r.date}</strong>: {r.content}
                  </button>
                </h2>
                <div
                  id={`collapse-past-${r._id}`}
                  className={`accordion-collapse collapse ${activePastAccordion === index ? "show" : ""}`}
                >
                  <div className="accordion-body">
                    {(r.subTasks || []).map((task, idx) => (
                      <div className="form-check mb-2" key={idx}>
                        <input
                          className="form-check-input me-2"
                          type="checkbox"
                          checked={taskState[r._id]?.[idx] || false}
                          onChange={() => toggleTask(r._id, idx)}
                          id={`task-${r._id}-${idx}`}
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
        </>
      )}
    </div>
  );
}
