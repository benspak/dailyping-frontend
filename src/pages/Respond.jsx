import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Respond() {
  const { token, loading } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [goal, setGoal] = useState('');
  const [subTasks, setSubTasks] = useState(['', '', '']);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submittedGoal, setSubmittedGoal] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) return;

      // const token = localStorage.getItem('token');
      console.log('🔐 Token:', token);

      try {
        const res = await axios.get('https://api.dailyping.org/api/responses/today', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.alreadySubmitted) {
          setAlreadySubmitted(true);
          setSubmittedGoal(res.data.content);
          setGoal(res.data.content || '');

          if (Array.isArray(res.data.subTasks)) {
            const texts = res.data.subTasks.map((t) => t.text || '');
            setSubTasks([...texts, '', '', ''].slice(0, 3));
          }
        }
      } catch (err) {
        console.error('❌ Verification error:', err);
        alert('Login expired. Please log in again.');
        navigate('/');
      }
    };

    if (!loading) verify();
  }, [token, loading, navigate]);

  const handleSubTaskChange = (index, value) => {
    const updated = [...subTasks];
    updated[index] = value;
    setSubTasks(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const filtered = subTasks
        .map((text) => text.trim())
        .filter((text) => text !== '')
        .map((text) => ({ text }));

      await axios.post(
        'https://api.dailyping.org/api/response',
        {
          content: goal,
          mode: 'goal',
          subTasks: filtered,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAlreadySubmitted(true);
      setSubmittedGoal(goal);
    } catch (err) {
      console.error('❌ Submit error:', err);
      alert('Error submitting your goal.');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="container py-5">
        <div className="alert alert-success text-center">
          ✅ You already submitted your goal today.
          <blockquote className="blockquote mt-3">
            <p className="mb-0">{submittedGoal}</p>
          </blockquote>

          {subTasks.some((t) => t) && (
            <ul className="list-group mt-3">
              {subTasks.map((task, i) =>
                task ? <li key={i} className="list-group-item">{task}</li> : null
              )}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="w-100" style={{ maxWidth: '600px' }}>
        <div className="card shadow-sm p-4">
          <h3 className="mb-4 text-center">What’s your #1 goal today?</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <textarea
                className="form-control"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={4}
                placeholder="Write your goal here..."
                required
              />
            </div>

            <h6 className="text-muted">Optional sub-tasks:</h6>
            {[0, 1, 2].map((i) => (
              <input
                key={i}
                type="text"
                className="form-control mb-2"
                placeholder={`Sub-task ${i + 1}`}
                value={subTasks[i]}
                onChange={(e) => handleSubTaskChange(i, e.target.value)}
              />
            ))}

            <button type="submit" className="btn btn-primary w-100 mt-3">
              Submit Goal
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
