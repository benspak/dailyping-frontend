import React, { useState } from 'react';
import axios from 'axios';

export default function AdminPanel() {
  const [pushStatus, setPushStatus] = useState('');

  const sendTestPush = async () => {
    const token = localStorage.getItem('token');
    try {
      setPushStatus('Sending...');
      const res = await axios.post('https://api.dailyping.org/test/send-push', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPushStatus(`✅ Sent: ${res.data.message || 'Success'}`);
    } catch (err) {
      console.error('❌ Push error:', err.message);
      setPushStatus(`❌ Failed: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="card shadow-sm p-4">
      <h5 className="mb-3">🛠 Admin Tools</h5>
      <button className="btn btn-outline-primary mb-2" onClick={sendTestPush}>
        🚀 Send Me a Push Notification
      </button>
      {pushStatus && <div className="mt-2 text-muted">{pushStatus}</div>}
    </div>
  );
}
