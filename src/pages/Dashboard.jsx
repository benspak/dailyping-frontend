import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminPanel from '../components/AdminPanel';
import { registerPush } from '../utils/registerPush';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState([]);
  const [taskState, setTaskState] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await axios.get('https://api.dailyping.org/api/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
        await registerPush();
      } catch {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    };

    const fetchResponses = async () => {
      try {
        const res = await axios.get('https://api.dailyping.org/api/responses/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResponses(res.data);

        // Initialize taskState based on current subTask check state
        const state = {};
        res.data.forEach(resp => {
          if (Array.isArray(resp.subTasks)) {
            state[resp._id] = resp.subTasks.map(t => t.checked);
          }
        });
        setTaskState(state);
      } catch {
        setResponses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchResponses();
  }, []);

  const toggleTask = async (responseId, taskIndex) => {
    const current = taskState[responseId]?.[taskIndex] || false;
    const updated = {
      ...taskState,
      [responseId]: [...(taskState[responseId] || [])]
    };
    updated[responseId][taskIndex] = !current;
    setTaskState(updated);

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`https://api.dailyping.org/api/response/${responseId}/subtasks`, {
        index: taskIndex,
        checked: !current
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('❌ Failed to update subtask:', err.message);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Welcome */}
      <div className="card shadow-sm p-4 mb-4">
        <h2 className="mb-3 text-center">Welcome, {user?.email}</h2>
        <div className="d-flex flex-wrap justify-content-center gap-4">
          <div>
            <p className="mb-1 fw-bold text-muted text-center">Current Streak</p>
            <span className="badge bg-success fs-5">{user?.streak?.current ?? 0} days</span>
          </div>
          <div>
            <p className="mb-1 fw-bold text-muted text-center">Pro Status</p>
            <span className={`badge fs-5 ${user?.pro ? 'bg-primary' : 'bg-secondary'}`}>
              {user?.pro ? '✅ Active' : '❌ Not active'}
            </span>
          </div>
        </div>
      </div>

      {/* CTA */}
      {!user?.pro && (
        <div className="alert alert-warning text-center mb-4">
          <h5 className="mb-2">⭐ Unlock Pro</h5>
          <p>Customize your ping time, choose a tone, get weekly reports & more.</p>
          <button
            className="btn btn-primary btn-sm"
            onClick={async () => {
              const token = localStorage.getItem('token');
              const res = await axios.post('https://api.dailyping.org/billing/create-checkout-session', {}, {
                headers: { Authorization: `Bearer ${token}` }
              });
              window.location.href = res.data.url;
            }}
          >
            Go Pro for $5/month
          </button>
        </div>
      )}

      {/* Responses */}
      <h4 className="mb-3">Your Past Goals</h4>
      {responses.length === 0 ? (
        <p className="text-muted">No responses yet.</p>
      ) : (
        <ul className="list-group">
          {responses.map((r) => (
            <li key={r._id} className="list-group-item">
              <strong>{r.date}:</strong> {r.content}
              {Array.isArray(r.subTasks) && r.subTasks.length > 0 && (
                <ul className="mt-2">
                  {r.subTasks.map((task, idx) => (
                    <li key={idx} className="form-check">
                      <input
                        className="form-check-input me-2"
                        type="checkbox"
                        checked={taskState[r._id]?.[idx] || false}
                        onChange={() => toggleTask(r._id, idx)}
                        id={`task-${r._id}-${idx}`}
                      />
                      <label htmlFor={`task-${r._id}-${idx}`} className="form-check-label">
                        {task.text}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Admin */}
      {user?.isAdmin && (
        <div className="mt-5">
          <AdminPanel />
        </div>
      )}
    </div>
  )
}
