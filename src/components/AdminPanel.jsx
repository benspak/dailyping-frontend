import React, { useState } from 'react';
import axios from 'axios';

export default function AdminPanel() {
  const [pushStatus, setPushStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('Test Push');
  const [body, setBody] = useState('👋 Hello from DailyPing! Push is working.');

  const sendTestPush = async () => {
    const token = localStorage.getItem('token');

    try {
      setIsLoading(true);
      setPushStatus('Sending...');

      const res = await axios.post(
        'https://api.dailyping.org/test/send-push',
        { title, body },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPushStatus(`✅ Sent: ${res.data.message || 'Push delivered.'}`);
    } catch (err) {
      console.error('❌ Push error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
      const detail = err.response?.data?.details || '';
      setPushStatus(`❌ Failed: ${errorMsg} ${detail && `(${detail})`}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card shadow-sm p-4">
      <h5 className="mb-3">🛠 Admin Tools</h5>

      <div className="mb-3">
        <label className="form-label">Push Title</label>
        <input
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Push notification title"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Push Body</label>
        <textarea
          className="form-control"
          rows={2}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Push message body"
        />
      </div>

      <button className="btn btn-outline-primary" onClick={sendTestPush} disabled={isLoading}>
        🚀 Send Test Push
      </button>

      {pushStatus && (
        <div className="mt-3 text-muted" style={{ whiteSpace: 'pre-wrap' }}>
          {pushStatus}
        </div>
      )}
    </div>
  );
}
