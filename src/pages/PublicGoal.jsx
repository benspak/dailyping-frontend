import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function PublicGoal() {
  const { username, date } = useParams();
  const [goal, setGoal] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`https://api.dailyping.org/api/public-goal/${username}/${date}`)
      .then(res => setGoal(res.data))
      .catch(err => setError(err.response?.data?.error || 'Error loading goal'));
  }, [username, date]);

  if (error) return <div className="container py-5 text-center text-danger">{error}</div>;
  if (!goal) return <div className="container py-5 text-center">Loading goal...</div>;

  return (
    <div className="container py-5" style={{ maxWidth: '700px' }}>
      <h3 className="mb-3 text-center">🎯 {goal.username}'s Goal for {goal.date}</h3>
      <blockquote className="blockquote text-center mb-4">
        <p className="mb-0">{goal.content}</p>
      </blockquote>
      {goal.subTasks?.length > 0 && (
        <ul className="list-group">
          {goal.subTasks.map((task, idx) => (
            <li key={idx} className="list-group-item">
              {task.completed ? <s>{task.text}</s> : task.text}
            </li>
          ))}
        </ul>
      )}
      {goal.edited && (
        <p className="text-muted mt-3 text-center small">✏️ This goal was edited after submission.</p>
      )}
    </div>
  );
}
