// Goals.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    const fetchGoals = async () => {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/api/goals', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGoals(data);
    };
    fetchGoals();
  }, []);

  const todaysGoals = goals.filter(goal => goal.date === new Date().toISOString().split('T')[0]);
  const upcomingGoals = goals.filter(goal => new Date(goal.date) > new Date());
  const pastGoals = goals.filter(goal => new Date(goal.date) < new Date());
  const completedGoals = goals.filter(goal => goal.completed);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-xl shadow-md mb-6">
        <h2 className="text-lg font-semibold">🔥 DailyPing Stats</h2>
        <p className="text-sm">5 Goals Completed Today • 10-Day Streak</p>
      </div>

      <div className="flex justify-between items-center mt-4">
        <h1 className="text-2xl font-bold">Your Goals</h1>
        <button className="btn">+ New Goal</button>
      </div>

      <div className="flex justify-end mt-2">
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={() => setShowCompleted(!showCompleted)}
          />
          <span className="text-sm">Show Completed</span>
        </label>
      </div>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-blue-700">Today</h2>
        {todaysGoals.map(goal => (
          <div key={goal._id} className={`bg-white shadow-md rounded-xl p-4 border mb-4 ${goal.completed ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">{goal.title}</h2>
              {goal.completed && <span className="text-green-500 text-sm font-bold">✔ Done</span>}
            </div>
            <p className="text-gray-500 text-sm">Due: {new Date(goal.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
            <ul className="mt-2">
              {goal.subtasks?.map((task, i) => (
                <li key={i} className="flex items-center space-x-2">
                  <input type="checkbox" checked={task.completed} readOnly />
                  <span className={task.completed ? 'line-through text-gray-400' : ''}>{task.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex space-x-2">
              <button className="btn-sm btn-outline">Edit</button>
              <button className="btn-sm btn-success">Complete</button>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-purple-700">Upcoming</h2>
        {upcomingGoals.map(goal => (
          <div key={goal._id} className="bg-white shadow-md rounded-xl p-4 border mb-4">
            <h2 className="text-lg font-semibold text-gray-800">{goal.title}</h2>
            <p className="text-gray-500 text-sm">Due: {new Date(goal.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
          </div>
        ))}
      </section>

      {showCompleted && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold text-green-700">Completed</h2>
          {completedGoals.map(goal => (
            <div key={goal._id} className="bg-white shadow-md rounded-xl p-4 border mb-4 opacity-60">
              <h2 className="text-lg font-semibold text-gray-800">{goal.title}</h2>
              <p className="text-gray-500 text-sm">Completed on: {new Date(goal.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
          ))}
        </section>
      )}

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-gray-700">Past</h2>
        {pastGoals.map(goal => (
          <div key={goal._id} className="bg-white shadow-md rounded-xl p-4 border mb-4">
            <h2 className="text-lg font-semibold text-gray-800">{goal.title}</h2>
            <p className="text-gray-500 text-sm">Due: {new Date(goal.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
