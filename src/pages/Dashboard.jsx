import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminPanel from '../components/AdminPanel';
import { registerPush } from '../utils/registerPush';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [responses, setResponses] = useState([]);
  const [taskState, setTaskState] = useState({}); // checkbox state

  useEffect(() => {
    if (!user) return;

    const fetchResponses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://api.dailyping.org/api/responses/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResponses(res.data);

        // Pre-fill taskState with completed values
        const initialState = {};
        res.data.forEach((r) => {
          initialState[r._id] = {};
          r.subTasks?.forEach((t, i) => {
            initialState[r._id][i] = t.completed;
          });
        });
        setTaskState(initialState);
      } catch {
        setResponses([]);
      }
    };

    fetchResponses();
    registerPush();
  }, [user]);

  const toggleTask = async (responseId, index) => {
    const token = localStorage.getItem('token');

    const updated = {
      ...taskState,
      [responseId]: {
        ...(taskState[responseId] || {}),
        [index]: !taskState[responseId]?.[index]
      }
    };
    setTaskState(updated);

    try {
      await axios.post(
        'https://api.dailyping.org/api/response/toggle-subtask',
        { responseId, index, completed: updated[responseId][index] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('❌ Failed to update subtask:', err);
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

  return (
    <div className="container py-5">
      <div className="card shadow-sm p-4 mb-4">
        <h2 className="mb-3 text-center">Welcome, {user.email}</h2>
        <div className="d-flex flex-wrap justify-content-center gap-4">
          <div>
            <p className="mb-1 fw-bold text-muted text-center">Current Streak</p>
            <span className="badge bg-success fs-5">{user.streak?.current ?? 0} days</span>
          </div>
          <div>
            <p className="mb-1 fw-bold text-muted text-center">Pro Status</p>
            <span className={`badge fs-5 ${user.pro ? 'bg-primary' : 'bg-secondary'}`}>
              {user.pro ? '✅ Active' : '❌ Not active'}
            </span>
          </div>
        </div>
      </div>

      {!user.pro && (
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

      <h4 className="mb-3">Your Past Goals</h4>
      {responses.length === 0 ? (
        <p className="text-muted">No responses yet.</p>
      ) : (
        <ul className="list-group">
          {responses.map(r => (
            <li key={r._id} className="list-group-item">
              <strong>{r.date}:</strong> {r.content}
              <ul className="mt-2">
                {(r.subTasks || []).map((task, idx) => (
                  task.text && (
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
                  )
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      {user.isAdmin && (
        <div className="mt-5">
          <AdminPanel />
        </div>
      )}
    </div>
  );
}
