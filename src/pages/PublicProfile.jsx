import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import md5 from 'md5';

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`https://api.dailyping.org/public/user/${username}`);
        setProfile(res.data.user);
        setGoals(res.data.goals);
      } catch (err) {
        console.error('❌ Failed to load public profile:', err);
      }
    };
    fetchProfile();
  }, [username]);

  if (!profile) return <div className="container py-5 text-center">Could not find that user ...</div>;

  return (
    <div className="container py-5">
      <div className="card shadow-sm p-4 mb-4">
        <div className="row align-items-center">
          <div className="col-md-auto text-center mb-3 mb-md-0">
            <img
              src={``}
              alt="User Avatar"
              className="rounded-circle"
              width="80"
              height="80"
            />
          </div>
          <div className="col-md">
            <h5 className="fw-bold mb-1">@{profile.username}</h5>
            <p className="text-muted mb-1">{profile.bio || 'No bio provided.'}</p>
            <p className="mb-0">🔥 Streak: {profile.streak?.current ?? 0} days</p>
          </div>
          <div className="col-md-auto text-center mt-3 mt-md-0">
            <span className={`badge fs-6 ${profile.pro === 'active' ? 'bg-primary' : 'bg-secondary'}`}>
              {profile.pro === 'active' ? '✅ Pro Member' : 'Free Member'}
            </span>
          </div>
        </div>
      </div>

      <h4 className="mb-3">Recent Public Goals</h4>
      {goals.length === 0 ? (
        <p className="text-muted">No public goals shared yet.</p>
      ) : (
        <div className="accordion" id="publicGoals">
          {goals.map((g, index) => (
            <div className="accordion-item" key={g._id}>
              <h2 className="accordion-header" id={`heading-${g._id}`}>
                <button
                  className={`accordion-button ${index !== 0 ? 'collapsed' : ''}`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse-${g._id}`}
                >
                  <strong>{g.date}</strong>: {g.content}
                </button>
              </h2>
              <div
                id={`collapse-${g._id}`}
                className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
              >
                <div className="accordion-body">
                  {(g.subTasks || []).map((task, idx) => (
                    <p key={idx} className="mb-1">• {task.text}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
