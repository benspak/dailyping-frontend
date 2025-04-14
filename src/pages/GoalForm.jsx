import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ReminderForm from '../components/ReminderForm';
import { useAuth } from '../context/AuthContext';
import { Button, Spinner } from 'react-bootstrap';

export default function GoalForm() {
  const { user, refresh } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [tokenValid, setTokenValid] = useState(false);
  const [goal, setGoal] = useState('');
  const [goalReminders, setGoalReminders] = useState([]);
  const [submittedGoalId, setSubmittedGoalId] = useState(null);
  const [subTasks, setSubTasks] = useState([
    { text: '', reminders: [] },
    { text: '', reminders: [] },
    { text: '', reminders: [] }
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [suggestedSubtasks, setSuggestedSubtasks] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(null);

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem('token');
    const goalId = params.get('id');

    const verifyAndLoad = async (tokenToUse) => {
      try {
        const checkRes = await axios.get(`https://api.dailyping.org/api/goals/today`, {
          headers: { Authorization: `Bearer ${tokenToUse}` }
        });

        setTokenValid(true);
        localStorage.setItem('token', tokenToUse);

        return true;
      } catch (err) {
        console.warn('⚠️ Token invalid or expired:', err.message);
        return false;
      }
    };

    (async () => {
      if (tokenFromStorage && await verifyAndLoad(tokenFromStorage)) {
        if (goalId) {
          const res = await axios.get(`https://api.dailyping.org/api/goal/${goalId}`, {
            headers: { Authorization: `Bearer ${tokenFromStorage}` }
          });
          const data = res.data;
          setGoal(data.content || '');
          setSubmittedGoalId(data._id);
          setGoalReminders(data.reminders || []);
          setNote(data.note || '');
          setDate(data.date || '');
          const padded = Array.isArray(data.subTasks) ? [...data.subTasks] : [];
          while (padded.length < 3) padded.push({ text: '', reminders: [] });
          setSubTasks(padded.slice(0, 3));
          setIsEditing(true);
        }
        return;
      }

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
    const headers = { Authorization: `Bearer ${token}` };

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
        note,
        date
      };

      if (submittedGoalId) {
        await axios.put(`https://api.dailyping.org/api/goal/${submittedGoalId}`, payload, { headers });
      } else {
        await axios.post(`https://api.dailyping.org/api/goal`, payload, { headers });

        // 🎯 Trigger streak update
        await axios.post(`https://api.dailyping.org/api/streak/update`, {}, { headers });
      }

      navigate('/goals');
    } catch (err) {
      console.error('❌ Submission error:', err.response?.data || err.message);
      alert('Error submitting your goal.');
    }
  };

  const isStillVerifying = !tokenValid;

  const fetchSubtaskSuggestions = async () => {
    if (!goal) return;

    setLoadingSuggestions(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        'https://api.dailyping.org/api/ai/suggest-subtasks',
        { goal },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuggestedSubtasks(data.subtasks);
    } catch (err) {
      alert('Failed to get suggestions.');
      console.error(err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="w-100" style={{ maxWidth: '600px' }}>
        <div className="card shadow-sm p-4">
          <h3 className="mb-4 text-center">
            {isEditing ? 'Edit your goal' : 'What’s your goal?'}
          </h3>

          <Button variant="secondary" onClick={fetchSubtaskSuggestions} disabled={!goal || loadingSuggestions}>
            {loadingSuggestions ? <Spinner size="sm" animation="border" /> : '✨ Suggest Subtasks with AI'}
          </Button>

          {suggestedSubtasks.length > 0 && (
            <div className="mt-3">
              <p><strong>Suggested Subtasks:</strong></p>
              {suggestedSubtasks.map((task, i) => (
                <div key={i}>
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="me-2 mb-2"
                    onClick={() => {
                      const updated = [...subTasks];
                      const firstBlankIndex = updated.findIndex((s) => !s.text.trim());
                      if (firstBlankIndex === -1) return; // no empty slot

                      updated[firstBlankIndex].text = task;
                      setSubTasks(updated);
                      setSuggestedSubtasks((prev) => prev.filter((_, idx) => idx !== i));
                      setHighlightedIndex(firstBlankIndex);
                      setTimeout(() => setHighlightedIndex(null), 800);
                    }}
                  >
                    ✅ Add: {task}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {!isStillVerifying ? (
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
              <div className="mb-3">
                <label className="form-label fw-bold">Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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

              <h6 className="text-muted">Sub-tasks:</h6>
              {subTasks.slice(0, showAll ? 5 : 1).map((_, i) => (
                <div key={i} className="mb-3">
                  <input
                    type="text"
                    className={`form-control mb-2 ${highlightedIndex === i ? 'border-success border-3 flash-border' : ''}`}
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

              {!showAll && (
                <div className="text-end mb-3">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setShowAll(true)}
                  >
                    + Add More Subtasks
                  </button>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-bold">Note (optional)</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Any notes about your goal..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 mt-3">
                {isEditing ? 'Update Goal' : 'Submit Goal'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  className="btn btn-outline-danger w-100 mt-2"
                  onClick={async () => {
                    const confirmed = window.confirm("Are you sure you want to delete this goal?");
                    if (!confirmed) return;

                    const token = localStorage.getItem('token');
                    try {
                      await axios.delete(`https://api.dailyping.org/api/goal/${submittedGoalId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      navigate('/goals');
                    } catch (err) {
                      console.error("❌ Deletion error:", err.response?.data || err.message);
                      alert("Failed to delete goal.");
                    }
                  }}
                >
                  🗑️ Delete Goal
                </button>
              )}
            </form>
          ) : (
            <div className="container mt-5">Verifying token...</div>
          )}
        </div>
      </div>
    </div>
  );
}
