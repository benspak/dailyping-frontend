import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ReminderForm from '../components/ReminderForm';
import { useAuth } from '../context/AuthContext';

export default function Respond() {
  const { user, refresh } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [tokenValid, setTokenValid] = useState(false);
  const [goal, setGoal] = useState('');
  const [goalReminders, setGoalReminders] = useState([]);
  const [submittedGoalId, setSubmittedGoalId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [subTasks, setSubTasks] = useState([
    { text: '', reminders: [] },
    { text: '', reminders: [] },
    { text: '', reminders: [] }
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem('token');
    const tokenFromUrl = params.get('token');

    const verifyAndLoad = async (tokenToUse) => {
      try {
        const checkRes = await axios.get(`https://api.dailyping.org/api/responses/today`, {
          headers: { Authorization: `Bearer ${tokenToUse}` }
        });

        setTokenValid(true);
        localStorage.setItem('token', tokenToUse);

        if (checkRes.data.alreadySubmitted) {
          setAlreadySubmitted(true);
          setGoal(checkRes.data.content || '');
          setSubmittedGoalId(checkRes.data._id || '');
          setGoalReminders(checkRes.data.reminders || []);
          setNotes(checkRes.data.notes || '');

          const padded = Array.isArray(checkRes.data.subTasks) ? [...checkRes.data.subTasks] : [];
          while (padded.length < 3) padded.push({ text: '', reminders: [] });
          setSubTasks(padded.slice(0, 3));
        }

        return true; // ✅ this was missing
      } catch (err) {
        console.warn('⚠️ Token invalid or expired:', err.message);
        return false;
      }
    };

    (async () => {
      if (tokenFromStorage && await verifyAndLoad(tokenFromStorage)) return;
      if (tokenFromUrl && await verifyAndLoad(tokenFromUrl)) return;

      alert('Login link is invalid or expired.');
      navigate('/login');
    })();
  }, [params, navigate]);

  const handleSubTaskTextChange = (index, value) => {
    const updated = [...subTasks];
    updated[index].text = value;
    setSubTasks(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const urlToken = params.get('token');

    const filteredSubTasks = subTasks
      .filter((task) => task.text.trim() !== '')
      .map((task) => ({
        text: task.text.trim(),
        reminders: user?.pro === 'active' ? (task.reminders || []) : []
      }));

    try {
      const payload = {
        content: goal,
        mode: 'goal',
        reminders: user?.pro === 'active' ? goalReminders : [],
        subTasks: filteredSubTasks,
        notes
      };

      if (alreadySubmitted && submittedGoalId) {
        await axios.put(`https://api.dailyping.org/api/response/${submittedGoalId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`https://api.dailyping.org/api/response`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate('/dashboard');
        return;
      }

      setSubmitted(true);
      setIsEditing(false);
    } catch (err) {
      console.error('❌ Submission error:', err.response?.data || err.message);
      alert('Error submitting your goal.');
    }
  };

  if (!tokenValid) return <div className="container mt-5">Verifying token...</div>;

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="w-100" style={{ maxWidth: '600px' }}>
        <div className="card shadow-sm p-4">
          <h3 className="mb-4 text-center">
            {alreadySubmitted ? (isEditing ? 'Edit your goal for today' : 'Your goal for today') : 'What’s your #1 goal today?'}
          </h3>

          {alreadySubmitted && !isEditing ? (
            <>
              <blockquote className="blockquote text-center">
                <p className="mb-0">{goal}</p>
              </blockquote>
              <ul className="mt-3">
                {subTasks.map((task, idx) => task.text && (
                  <li key={idx}>
                    {task.text}
                    {Array.isArray(task.reminders) && task.reminders.length > 0 && (
                      <ul className="small text-muted ms-3" style={{ listStyle: 'none', paddingLeft: 0 }}>
                        {task.reminders.map((r, i) => (
                          <li key={i}>⏰ {r}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
              <div className="text-center mt-3">
                <button className="btn btn-outline-secondary" onClick={() => setIsEditing(true)}>
                  Edit
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="form-control"
                  rows="4"
                  placeholder="Write your goal here..."
                  required
                />
              </div>

              {user?.pro === 'active' ? (
                <div className="mb-4">
                  <label className="form-label fw-bold">Goal Reminders</label>
                  <ReminderForm reminders={goalReminders} setReminders={setGoalReminders} />
                </div>
              ) : (
                <div className="alert alert-info text-center">
                  <button
                    className="btn btn-link p-0 text-decoration-none"
                    onClick={async () => {
                      const token = localStorage.getItem('token');
                      try {
                        const res = await axios.post(
                          'https://api.dailyping.org/billing/create-checkout-session',
                          {},
                          { headers: { Authorization: `Bearer ${token}` } }
                        )
                        refresh();
                        window.location.href = res.data.url;
                      } catch (err) {
                        console.error('❌ Stripe checkout error:', err.message);
                        alert('Failed to initiate checkout.');
                      }
                    }}
                  >
                    Upgrade to Pro to schedule reminders ⏰
                  </button>
                </div>
              )}

              <h6 className="text-muted">Optional sub-tasks:</h6>
              {[0, 1, 2].map((i) => (
                <div key={i} className="mb-3">
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder={`Sub-task ${i + 1}`}
                    value={subTasks[i]?.text || ''}
                    onChange={(e) => handleSubTaskTextChange(i, e.target.value)}
                  />
                  {user?.pro === 'active' && (
                    <ReminderForm
                      reminders={subTasks[i]?.reminders || []}
                      setReminders={(newReminders) => {
                        const updated = [...subTasks];
                        updated[i].reminders = newReminders;
                        setSubTasks(updated);
                      }}
                    />
                  )}
                </div>
              ))}

              <div className="mb-3">
                <label className="form-label fw-bold">Notes (optional)</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Any notes about your goal..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 mt-3">
                {alreadySubmitted ? 'Update Goal' : 'Submit Goal'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
