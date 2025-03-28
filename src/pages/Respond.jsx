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
        const res = await axios.post('/auth/verify', { token: tokenToVerify });
        localStorage.setItem('token', res.data.token);
        setTokenValid(true);

        // Check if already submitted today
        const checkRes = await axios.get('/api/responses/today', {
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
        '/api/response',
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

  if (!tokenValid) return <div className="container mt-5">Verifying token...</div>;

  if (submitted || alreadySubmitted) {
    return (
      <div className="container mt-5 alert alert-info">
        ✅ You already submitted your goal today:
        <blockquote className="mt-2">{submittedGoal}</blockquote>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-3">What’s your #1 goal today?</h2>
      <form onSubmit={submitResponse}>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="form-control mb-3"
          rows="4"
          required
        />
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
}
