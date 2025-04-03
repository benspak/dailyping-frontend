import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminPanel from '../components/AdminPanel';
import { registerPush } from '../utils/registerPush';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [responses, setResponses] = useState([]);
  const [taskState, setTaskState] = useState({});
  const [activeAccordion, setActiveAccordion] = useState(null);

  useEffect(() => {
    if (!user) return;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.action === 'play-ping-sound') {
          const audio = new Audio('/Done.mp3');
          audio.play().catch(err => console.warn('🔇 Unable to autoplay sound:', err));
        }
      });
    }

    const fetchResponses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://api.dailyping.org/api/responses/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResponses(res.data);

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
        <div className="accordion" id="goalsAccordion">
          {responses.map((r, index) => (
            <div className="accordion-item" key={r._id}>
              <h2 className="accordion-header" id={`heading-${r._id}`}>
                <button
                  className={`accordion-button ${activeAccordion === index ? '' : 'collapsed'}`}
                  type="button"
                  onClick={() =>
                    setActiveAccordion(activeAccordion === index ? null : index)
                  }
                >
                  <strong>{r.date}</strong>: {r.content}
                </button>
              </h2>
              <div
                id={`collapse-${r._id}`}
                className={`accordion-collapse collapse ${activeAccordion === index ? 'show' : ''}`}
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

      {user.isAdmin && (
        <div className="mt-5">
          <AdminPanel />
        </div>
      )}
    </div>
  );
}
