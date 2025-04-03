import React from 'react';

const changelogEntries = [
  {
    date: '2025-04-06',
    title: 'Push Notifications Enhanced',
    description: 'Now includes sound on ping delivery and improved reliability with new VAPID logic.',
    type: 'update'
  },
  {
    date: '2025-04-05',
    title: 'Subtasks with Completion Tracking',
    description: 'You can now check off subtasks from the dashboard and have them saved.',
    type: 'feature'
  },
  {
    date: '2025-04-04',
    title: 'Fix: Duplicate Push & Email',
    description: 'Resolved issue where duplicate notifications were sent on some pings.',
    type: 'bugfix'
  },
  {
    date: '2025-04-01',
    title: 'PWA + Installable App',
    description: 'DailyPing is now installable as a Progressive Web App (PWA)!',
    type: 'feature'
  }
];

const typeBadge = {
  feature: 'primary',
  update: 'info',
  bugfix: 'danger'
};

export default function Changelog() {
  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center">📢 DailyPing Change Log</h2>
      <ul className="list-group">
        {changelogEntries.map((entry, idx) => (
          <li key={idx} className="list-group-item">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-1">{entry.title}</h5>
              <span className={`badge bg-${typeBadge[entry.type]}`}>{entry.type}</span>
            </div>
            <p className="mb-1 text-muted">{entry.description}</p>
            <small className="text-secondary">{entry.date}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
