import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function Respond() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [tokenValid, setTokenValid] = useState(false);
  const [goal, setGoal] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submittedGoal, setSubmittedGoal] = useState('');
  const [subTasks, setSubTasks] = useState(['', '', '']);
  const [isEditing, setIsEditing] = useState(false);

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

        if (checkRes.data.alreadySubmitted) {
          setAlreadySubmitted(true);
          setSubmittedGoal(checkRes.data.content);
          setGoal(checkRes.data.content || '');

          if (Array.isArray(checkRes.data.subTasks)) {
            const taskTexts = checkRes.data.subTasks.map((t) => t.text || '');
            const filled = [...taskTexts, '', '', ''].slice(0, 3); // ensure 3 fields
            setSubTasks(filled);
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

  const handleSubTaskChange = (index, value) => {
    const updated = [...subTasks];
    updated[index] = value;
    setSubTasks(updated);
  };

  const submitResponse = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      const filteredSubTasks = subTasks
        .map((text) => text.trim())
        .filter((text) => text !== '')
        .map((text) => ({ text }));

      await axios.post(
        `https://api.dailyping.org/api/response`,
        {
          content: goal,
          mode: 'goal',
          subTasks: filteredSubTasks
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSubmitted(true);
      setIsEditing(false);
      setAlreadySubmitted(true);
      setSubmittedGoal(goal);
    } catch (err) {
      console.error('Submission error:', err.response?.data || err.message);
      alert('Error submitting your goal.');
    }
  };

  if (!tokenValid) return <div className="container mt-5">Verifying token...</div>;

  if ((submitted || alreadySubmitted) && !isEditing) {
    return (
      <div className="container py-5">
        <div className="alert alert-success text-center">
          ✅ You already submitted your goal today.
          <blockquote className="blockquote mt-3">
            <p className="mb-0">{submittedGoal}</p>
          </blockquote>
          <button className="btn btn-outline-secondary mt-3" onClick={() => setIsEditing(true)}>
            Edit Goal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="w-100" style={{ maxWidth: '600px' }}>
        <div className="card shadow-sm p-4">
          <h3 className="mb-4 text-center">{alreadySubmitted ? 'Edit your goal for today' : 'What’s your #1 goal today?'}</h3>
          <form onSubmit={submitResponse}>
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
              {alreadySubmitted ? 'Update Goal' : 'Submit Goal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
