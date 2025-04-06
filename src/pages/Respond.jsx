import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ReminderForm from '../components/ReminderForm';

export default function Respond() {
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
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const urlToken = params.get('token');

    const verifyToken = async (tokenToVerify) => {
      try {
        const res = await axios.post(`https://api.dailyping.org/auth/verify`, { token: tokenToVerify });
        localStorage.setItem('token', res.data.token);
        setTokenValid(true);

        const checkRes = await axios.get(`https://api.dailyping.org/api/responses/today`, {
          headers: { Authorization: `Bearer ${res.data.token}` }
        });

        setIsPro(res.data.pro || false);

        if (checkRes.data.alreadySubmitted) {
          setAlreadySubmitted(true);
          setGoal(checkRes.data.content || '');
          setSubmittedGoalId(checkRes.data._id || '');
          setGoalReminders(checkRes.data.reminders || []);

          if (Array.isArray(checkRes.data.subTasks)) {
            const padded = [...checkRes.data.subTasks];
            while (padded.length < 3) padded.push({ text: '', reminders: [] });
            setSubTasks(padded.slice(0, 3));
          }
        }
      } catch {
        alert('Login link is invalid or expired.');
        navigate('/');
      }
    };

    if (token) {
      verifyToken(token);
    } else if (urlToken) {
      verifyToken(urlToken);
    } else {
      alert('No token found. Please log in again.');
      navigate('/');
    }
  }, [params, navigate]);

  const handleSubTaskTextChange = (index, value) => {
    const updated = [...subTasks];
    updated[index].text = value;
    setSubTasks(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const filteredSubTasks = subTasks
      .filter((task) => task.text.trim() !== '')
      .map((task) => ({
        text: task.text.trim(),
        ...(isPro && { reminders: task.reminders || [] }) // ✅ only add reminders if Pro
      }));

    const payload = {
      content: goal,
      mode: 'goal',
      subTasks: filteredSubTasks,
    };

    if (user?.pro) {
      payload.reminders = goalReminders;
      // Include reminders for sub-tasks too
      payload.subTasks = filteredSubTasks.map((task) => ({
        text: task.text,
        reminders: task.reminders || []
      }));
    }

    try {
      if (alreadySubmitted && submittedGoalId) {
        await axios.put(`https://api.dailyping.org/api/response/${submittedGoalId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`https://api.dailyping.org/api/response`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setSubmitted(true);
      setIsEditing(false);
    } catch (err) {
      console.error('❌ Submission error:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Error submitting your goal.');
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
                      <ul className="small text-muted ms-3">
                        {task.reminders.map((r, i) => (
                          <li key={i}>Reminder: {r}</li>
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

              <div className="mb-4">
                <label className="form-label fw-bold">Goal Reminders</label>
                {isPro && (
                  <ReminderForm reminders={goalReminders} setReminders={setGoalReminders} />
                )}
              </div>

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
                  <ReminderForm
                    reminders={subTasks[i]?.reminders || []}
                    setReminders={(newReminders) => {
                      const updated = [...subTasks];
                      updated[i].reminders = newReminders;
                      setSubTasks(updated);
                    }}
                  />
                </div>
              ))}

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
