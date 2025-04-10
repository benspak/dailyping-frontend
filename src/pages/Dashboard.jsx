import React, { useEffect, useState } from "react";
import axios from "axios";
import { registerPush } from "../utils/registerPush";
import { useAuth } from "../context/AuthContext";
import md5 from "md5";
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, loading, refresh } = useAuth();
  const [responses, setResponses] = useState([]);
  const [taskState, setTaskState] = useState({});
  const [activeWeeklyAccordion, setActiveWeeklyAccordion] = useState(null);
  const [activePastAccordion, setActivePastAccordion] = useState(null);
  const todayDate = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Redirect if username needs to be set.
    if (user && !user.username) {
      navigate('/setup-username');
    }

    // Pro status check
    if(user) {
      refresh;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://api.dailyping.org/api/responses/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const updatedState = {};
        res.data.forEach((r) => {
          const subTaskStates = {};
          r.subTasks?.forEach((t, i) => {
            subTaskStates[i] = t.completed;
          });

          const allSubTasksComplete = r.subTasks?.length > 0 && r.subTasks.every(t => t.completed);
          updatedState[r._id] = {
            ...subTaskStates,
            goalCompleted: r.completed || allSubTasksComplete
          };
        });

        setResponses(res.data);
        setTaskState(updatedState);
        await registerPush();
      } catch {
        setResponses([]);
      }
    };

    fetchData();
  }, [user, refresh, navigate]);

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

        // Check if all subtasks are now completed
        const currentTaskStates = updated[responseId];
        const subTaskIndexes = Object.keys(currentTaskStates).filter(k => k !== "goalCompleted");
        const allComplete = subTaskIndexes.every(k => currentTaskStates[k]);

        if (allComplete && !currentTaskStates.goalCompleted) {
          await axios.post(
            "https://api.dailyping.org/api/response/toggle-goal",
            { responseId, completed: true },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          updated[responseId].goalCompleted = true;
          setTaskState({ ...updated });
        }
      }
    } catch (err) {
      console.error("❌ Failed to update task:", err);
    }
  };

  const renderReminders = (reminders) =>
    Array.isArray(reminders) && reminders.length > 0 ? (
      <ul className="text-muted small ps-3 mb-2" style={{ listStyle: "none", paddingLeft: 0 }}>
        {reminders.map((r, i) => (
          <li key={i}><i className="bi bi-clock me-1"></i>{r}</li>
        ))}
      </ul>
    ) : null;

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
            <h5 className="fw-bold mb-1">Welcome, {user.username}</h5>
            <p className="text-muted mb-0">{`${user.bio}` || "No bio provided."}</p>
          </div>
          <div className="col-md-auto text-center mt-3 mt-md-0">
            <div className="mb-2">
              <p className="mb-1 fw-bold text-muted">Current Streak</p>
              <span className="badge bg-success fs-6">{user.streak?.current ?? 0} days</span>
            </div>
            <div>
              <p className="mb-1 fw-bold text-muted">Pro Status</p>
              <span className={`badge fs-6 ${user.pro === 'active' ? "bg-primary" : "bg-secondary"}`}>
                {user.pro === 'active' ? "✅ Active" : "❌ Not active"}
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
              {todayGoal.notes && <p className="text-muted small fst-italic">{todayGoal.notes}</p>}
              {renderReminders(todayGoal.reminders)}
              {(todayGoal.subTasks || []).map((task, idx) => (
                <div key={idx} className="mb-3">
                  <div className="form-check mb-1">
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
                    {task.notes && <p className="text-info small fst-italic">{task.notes}</p>}
                  </div>
                  {renderReminders(task.reminders)}
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
                    onClick={() => setActiveWeeklyAccordion(activeWeeklyAccordion === index ? null : index)}
                  >
                    <span className={r.completed ? "text-decoration-line-through text-muted" : ""}>
                      <strong>{taskState[r._id]?.goalCompleted ? '✅ ' : ''}{r.date}</strong>: {r.content}
                    </span>
                  </button>
                </h2>
                <div
                  id={`collapse-week-${r._id}`}
                  className={`accordion-collapse collapse ${activeWeeklyAccordion === index ? "show" : ""}`}
                >
                  <div className="accordion-body">
                    {r.notes && <p className="text-info small fst-italic">{r.notes}</p>}
                    {renderReminders(r.reminders)}
                    {(r.subTasks || []).map((task, idx) => (
                      <div key={idx} className="mb-3">
                        <div className="form-check mb-1">
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
                          {task.notes && <p className="text-info small fst-italic">{task.notes}</p>}
                        </div>
                        {renderReminders(task.reminders)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Past Goals */}
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
                    onClick={() => setActivePastAccordion(activePastAccordion === index ? null : index)}
                  >
                    <span className={r.completed ? "text-decoration-line-through text-muted" : ""}>
                      <strong>{taskState[r._id]?.goalCompleted ? '✅ ' : ''}{r.date}</strong>: {r.content}
                    </span>
                  </button>
                </h2>
                <div
                  id={`collapse-past-${r._id}`}
                  className={`accordion-collapse collapse ${activePastAccordion === index ? "show" : ""}`}
                >
                  <div className="accordion-body">
                    {r.notes && <p className="text-info small fst-italic">{r.notes}</p>}
                    {renderReminders(r.reminders)}
                    {(r.subTasks || []).map((task, idx) => (
                      <div key={idx} className="mb-3">
                        <div className="form-check mb-1">
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
                          {task.notes && <p className="text-info small fst-italic">{task.notes}</p>}
                        </div>
                        {renderReminders(task.reminders)}
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
