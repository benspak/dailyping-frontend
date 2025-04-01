import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Respond() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { token, setToken } = useAuth();

  const [tokenValid, setTokenValid] = useState(false);
  const [goal, setGoal] = useState('');
  const [subTasks, setSubTasks] = useState(['', '', '']);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submittedGoal, setSubmittedGoal] = useState('');
  const [submittedTasks, setSubmittedTasks] = useState([]);
  const [responseId, setResponseId] = useState(null);

 useEffect(() => {
  const urlToken = params.get('token');

  const verifyAndFetch = async () => {
    const rawToken = token || urlToken || localStorage.getItem('token');
    if (!rawToken) {
      alert('No token found. Please log in again.');
      navigate('/');
      return;
    }

    // If coming from magic link, verify and store the new access token
    if (urlToken) {
      try {
        const res = await axios.post(`https://api.dailyping.org/auth/verify`, { token: urlToken });
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
      } catch {
        alert('Invalid or expired link.');
        navigate('/');
        return;
      }
    }

    setTokenValid(true);

    try {
      const authToken = urlToken ? localStorage.getItem('token') : rawToken;

      const checkRes = await axios.get(`https://api.dailyping.org/api/responses/today`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (checkRes.data.alreadySubmitted) {
        setAlreadySubmitted(true);
        setSubmittedGoal(checkRes.data.content || '');
        setSubmittedTasks(checkRes.data.subTasks || []);
        setResponseId(checkRes.data._id);
      }
    } catch (err) {
      console.error('❌ Error checking response:', err.message);
    }
  };

  verifyAndFetch();
}, [params, navigate, token]);


  const handleSubTaskChange = (index, value) => {
    const updated = [...subTasks];
    updated[index] = value;
    setSubTasks(updated);
  };

const submitResponse = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token');
  if (!token) {
    alert('No token found. Please log in again.');
    navigate('/login');
    return;
  }

  try {
    const filteredSubTasks = subTasks
      .map((text) => text.trim())
      .filter((text) => text !== '')
      .map((text, i) => ({
        text,
        completed: false
      }));

    const payload = {
      content: goal,
      mode: 'goal',
      subTasks: filteredSubTasks
    };

    if (alreadySubmitted && responseId) {
      payload.responseId = responseId; // include for update
    }

    await axios.post(
      'https://api.dailyping.org/api/response',
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setSubmitted(true);
    setIsEditing(false);
    setAlreadySubmitted(true);
    setSubmittedGoal(goal);
  } catch (err) {
    console.error('❌ Submission error:', err.response?.data || err.message);
    alert('Error submitting your goal.');
  }
};

  if (!tokenValid) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (alreadySubmitted || submitted) {
    return (
      <div className="container py-5">
        <div className="alert alert-success text-center">
          ✅ You already submitted your goal today.
          <blockquote className="blockquote mt-3">
            <p className="mb-0">{submittedGoal}</p>
          </blockquote>
          {submittedTasks.length > 0 && (
            <ul className="list-group mt-3">
              {submittedTasks.map((task, i) => (
                <li key={i} className="list-group-item">
                  📝 {task.text}
                </li>
              ))}
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
              Submit Goal
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
