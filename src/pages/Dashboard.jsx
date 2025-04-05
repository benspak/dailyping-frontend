import React, { useEffect, useState } from "react";
import axios from "axios";
import { registerPush } from "../utils/registerPush";
import { useAuth } from "../context/AuthContext";
import md5 from "md5";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [responses, setResponses] = useState([]);
  const [taskState, setTaskState] = useState({});
  const [activeAccordion, setActiveAccordion] = useState(null);

  const todayDate = new Date().toISOString().split("T")[0];
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

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
      await axios.post(
        index === "goalCompleted"
          ? "https://api.dailyping.org/api/response/toggle-goal"
          : "https://api.dailyping.org/api/response/toggle-subtask",
        index === "goalCompleted"
          ? { responseId, completed: updated[responseId][index] }
          : { responseId, index, completed: updated[responseId][index] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

  const todayGoal = responses.find((r) => r.date === todayDate);
  const recentGoals = responses
    .filter((r) => r.date !== todayDate && new Date(r.date) >= oneWeekAgo)
    .slice(0, 6);
  const olderGoals = responses.filter((r) => new Date(r.date) < oneWeekAgo);

  const renderGoalItem = (r, idx) => (
    <div className="accordion-item" key={r._id}>
      <h2 className="accordion-header" id={`heading-${r._id}`}>
        <div className="d-flex align-items-center w-100">
          <button
            className={`accordion-button ${activeAccordion === idx ? "" : "collapsed"}`}
            type="button"
            onClick={() => setActiveAccordion(activeAccordion === idx ? null : idx)}
          >
            <span className={r.completed ? "text-decoration-line-through text-muted" : ""}>
              <strong>{r.date}</strong>: {r.content}
            </span>
          </button>
        </div>
      </h2>
      <div
        id={`collapse-${r._id}`}
        className={`accordion-collapse collapse ${activeAccordion === idx ? "show" : ""}`}
      >
        <div className="accordion-body">
          {(r.subTasks || []).map((task, i) => (
            <div className="form-check mb-2" key={i}>
              <input
                className="form-check-input me-2"
                type="checkbox"
                id={`task-${r._id}-${i}`}
                checked={taskState[r._id]?.[i] || false}
                onChange={() => toggleTask(r._id, i)}
              />
              <label
                className={`form-check-label ${
                  taskState[r._id]?.[i] ? "text-decoration-line-through text-muted" : ""
                }`}
                htmlFor={`task-${r._id}-${i}`}
              >
                {task.text}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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
            <p className="mb-1 fw-bold text-muted">Current Streak</p>
            <span className="badge bg-success fs-6">{user.streak?.current ?? 0} days</span>
          </div>
        </div>
      </div>

      {/* Today's Goal */}
      {todayGoal && (
        <div className="accordion mb-4">
          <div className="accordion-item border border-success">
            <h2 className="accordion-header">
              <div className="d-flex align-items-center w-100 bg-success-subtle p-3">
                <h4 className="mb-0">{todayGoal.date}: {todayGoal.content}</h4>
              </div>
            </h2>
            <div className="accordion-body">
              {(todayGoal.subTasks || []).map((task, i) => (
                <div className="form-check mb-2" key={i}>
                  <input
                    className="form-check-input me-2"
                    type="checkbox"
                    checked={taskState[todayGoal._id]?.[i] || false}
                    onChange={() => toggleTask(todayGoal._id, i)}
                  />
                  <label
                    className={`form-check-label ${
                      taskState[todayGoal._id]?.[i] ? "text-decoration-line-through text-muted" : ""
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

      {/* This Week's Goals */}
      {recentGoals.length > 0 && (
        <>
          <h4 className="mb-3">This Week’s Goals</h4>
          <div className="accordion mb-5" id="recentGoalsAccordion">
            {recentGoals.map(renderGoalItem)}
          </div>
        </>
      )}

      {/* Older Goals */}
      {olderGoals.length > 0 && (
        <>
          <h4 className="mb-3">Your Past Goals</h4>
          <div className="accordion mb-5" id="olderGoalsAccordion">
            {olderGoals.map(renderGoalItem)}
          </div>
        </>
      )}
    </div>
  );
}
