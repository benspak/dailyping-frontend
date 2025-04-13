import React, { useEffect, useState } from "react";
import axios from "axios";
import { registerPush } from "../utils/registerPush";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import moment from "moment-timezone";

export default function Goals() {
  const { user, loading, refresh } = useAuth();
  const [goals, setGoals] = useState([]);
  const [taskState, setTaskState] = useState({});
  const [activeWeeklyAccordion, setActiveWeeklyAccordion] = useState(null);
  const [activePastAccordion, setActivePastAccordion] = useState(null);
  const userTimezone = user?.timezone || process.env.SERVER_TIMEZONE || "America/New_York";
  const now = moment().tz(userTimezone);
  const todayDate = now.format("YYYY-MM-DD");
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
        const res = await axios.get("https://api.dailyping.org/api/goals/all", {
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

        setGoals(res.data);
        setTaskState(updatedState);
        await registerPush();
      } catch {
        setGoals([]);
      }
    };

    fetchData();
  }, [user, refresh, navigate]);

  const toggleTask = async (goalId, index) => {
    const token = localStorage.getItem("token");
    const updated = {
      ...taskState,
      [goalId]: {
        ...(taskState[goalId] || {}),
        [index]: !taskState[goalId]?.[index],
      },
    };
    setTaskState(updated);

    try {
      if (index === "goalCompleted") {
        await axios.post(
          "https://api.dailyping.org/api/goal/toggle-goal",
          { goalId, completed: updated[goalId][index] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "https://api.dailyping.org/api/goal/toggle-subtask",
          { goalId, index, completed: updated[goalId][index] },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Check if all subtasks are now completed
        const currentTaskStates = updated[goalId];
        const subTaskIndexes = Object.keys(currentTaskStates).filter(k => k !== "goalCompleted");
        const allComplete = subTaskIndexes.every(k => currentTaskStates[k]);

        if (subTaskIndexes.length === 3 && allComplete && !currentTaskStates.goalCompleted) {
          await axios.post(
            "https://api.dailyping.org/api/goal/toggle-goal",
            { goalId, completed: true },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          updated[goalId].goalCompleted = true;
          setTaskState({ ...updated });

          // ✅ Play sound when all subtasks are completed
          const audio = new Audio("/Done.mp3");
          audio.play().catch(err => console.warn("Unable to autoplay sound:", err));
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
        <p>Please log in to view your goals.</p>
      </div>
    );
  }

  const oneWeekAgo = now.clone().subtract(6, "days").format("YYYY-MM-DD");
  const activeResponses = goals.filter((r) => !r.completed);
  const activeGoals = activeResponses.filter((r) => r.date === todayDate);
  const weeklyGoals = activeResponses.filter((r) => r.date > oneWeekAgo && r.date < todayDate);
  const olderGoals = activeResponses.filter((r) => r.date <= oneWeekAgo);

  return (
    <div className="container py-5">
    {goals.filter(g => g.date > todayDate).length > 0 && (
      <div className="mb-3">
        <h5 className="text-muted">Upcoming Goals</h5>
        <ul className="list-unstyled mb-2">
          {goals
            .filter(g => g.date > todayDate)
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 3)
            .map(goal => (
              <li key={goal._id} className="text-muted small">
                <strong>{goal.date}</strong>: {goal.content}
              </li>
          ))}
        </ul>
      </div>
    )}
    <h3>Today is {todayDate}</h3>
      {/* Header */}
      <div className="card shadow-sm mb-4">
        <div className="row align-items-center">
          <div className="col-md-auto text-center mt-3 mt-md-0">
            <div className="mb-2">
              <p className="mb-1 fw-bold text-muted">Goal Streak</p>
              <span className="badge bg-success fs-6">{user.streak?.current ?? 0} days</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 text-end">
        <a href="/goals/form" className="btn btn-primary">+ New Goal</a>
      </div>

      {/* Today's Goals */}
      {activeGoals.length > 0 && (
        <>
          <h4 className="mb-3">Today's Goals</h4>
          {activeGoals.map((todayGoal) => (
            <div className="card border-success mb-4" key={todayGoal._id}>
              <div className="card-body">
                <h5 className="card-title">
                  {todayGoal.completed ? (
                    <s className="text-muted">{todayGoal.content}</s>
                  ) : (
                    todayGoal.content
                  )}
                </h5>
                {renderReminders(todayGoal.reminders)}
                {todayGoal.date && (
                  <p className="text-muted small mb-2">
                    <strong>Due:</strong> {moment.tz(todayGoal.date, "YYYY-MM-DD", userTimezone).format("MMMM D, YYYY")}
                  </p>
                )}
                {todayGoal.note && <p className="text-muted small fst-italic">{todayGoal.note}</p>}
                <div className="text-end">
                  <a href={`/goals/form?id=${todayGoal._id}`} className="btn btn-sm btn-outline-secondary">
                    Edit
                  </a>
                </div>
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
                      {task.note && <p className="text-muted small fst-italic">{task.note}</p>}
                    </div>
                    {renderReminders(task.reminders)}
                  </div>
                ))}
              </div>
            </div>
          ))}
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
                    {renderReminders(r.reminders)}
                    {r.date && (
                      <p className="text-muted small mb-2">
                        <strong>Due:</strong> {moment.tz(r.date, "YYYY-MM-DD", userTimezone).format("MMMM D, YYYY")}
                      </p>
                    )}
                    {r.note && <p className="text-muted small fst-italic">{r.note}</p>}
                    <div className="text-end">
                      <a href={`/goals/form?id=${r._id}`} className="btn btn-sm btn-outline-secondary">
                        Edit
                      </a>
                    </div>
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
                          {task.note && <p className="text-muted small fst-italic">{task.note}</p>}
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
                    {r.note && <p className="text-muted small fst-italic">{r.note}</p>}
                    {renderReminders(r.reminders)}
                    <div className="text-end">
                      <a href={`/goals/form?id=${r._id}`} className="btn btn-sm btn-outline-secondary">
                        Edit
                      </a>
                    </div>
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
                          {task.note && <p className="text-muted small fst-italic">{task.note}</p>}
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
