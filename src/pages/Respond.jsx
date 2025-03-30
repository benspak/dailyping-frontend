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

  useEffect(() => {
    const localToken = localStorage.getItem('token');
    const urlToken = params.get('token');

    const verifyToken = async (tokenToVerify) => {
      try {
        const res = await axios.post(`https://api.dailyping.org/auth/verify`, { token: tokenToVerify });
        localStorage.setItem('token', res.data.token);
        setTokenValid(true);

        // Check if already submitted today
        const checkRes = await axios.get(`https://api.dailyping.org/api/responses/today`, {
          headers: { Authorization: `Bearer ${res.data.token}` }
        });

        if (checkRes.data.alreadySubmitted) {
          setAlreadySubmitted(true);
          setSubmittedGoal(checkRes.data.content);
        }
      } catch (err) {
        console.error('Token verification failed');
        alert('Login link is invalid or expired.');
        navigate('/');
      }
    };

    if (localToken) {
      verifyToken(localToken);
    } else if (urlToken) {
      verifyToken(urlToken);
    } else {
      alert('No token found. Please log in again.');
      navigate('/');
    }
  }, [params, navigate]);

  const submitResponse = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `https://api.dailyping.org/api/responses`,
        {
          content: goal,
          mode: 'goal',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err.response?.data || err.message);
      alert('Error submitting your goal.');
    }
  };

  if (!tokenValid) {
    return (
      <div className="container py-5">
        <p>Verifying token...</p>
      </div>
    );
  }

  if (submitted || alreadySubmitted) {
    return (
      <div className="container py-5">
        <div className="alert alert-success text-center">
          ✅ You already submitted your goal today.
          <blockquote className="blockquote mt-3">
            <p className="mb-0">{submittedGoal}</p>
          </blockquote>
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
            <button type="submit" className="btn btn-primary w-100">
              Submit Goal
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
