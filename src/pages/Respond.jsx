import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function Respond() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [tokenValid, setTokenValid] = useState(false);
  const [goal, setGoal] = useState('');
  const [submittedGoalId, setSubmittedGoalId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
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
          setGoal(checkRes.data.content || '');
          setSubmittedGoalId(checkRes.data._id || '');

          if (Array.isArray(checkRes.data.subTasks)) {
            const taskTexts = checkRes.data.subTasks.map((t) => t.text || '');
            const filled = [...taskTexts, '', '', ''].slice(0, 3);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const filteredSubTasks = subTasks
      .map((text) => text.trim())
      .filter((text) => text !== '')
      .map((text) => ({ text }));

    try {
      if (alreadySubmitted && submittedGoalId) {
        await axios.put(
          `https://api.dailyping.org/api/response/${submittedGoalId}`,
          {
            content: goal,
            subTasks: filteredSubTasks
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } else {
        await axios.post(
          `https://api.dailyping.org/api/response`,
          {
            content: goal,
            mode: 'goal',
            subTasks: filteredSubTasks
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }

      setSubmitted(true);
      setIsEditing(false);
    } catch (err) {
      console.error('Submission error:', err.response?.data || err.message);
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
                {subTasks.map((text, idx) => (
                  text && <li key={idx}>{text}</li>
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
          )}
        </div>
      </div>
    </div>
  );
}
