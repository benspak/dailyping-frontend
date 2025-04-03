import React, { useState } from 'react';
import axios from 'axios';

const defaultTemplates = [
  {
    name: 'Test Push',
    title: 'Test Push',
    body: '👋 Hello from DailyPing! Push is working.'
  },
  {
    name: 'Motivational Ping',
    title: 'Let’s Go!',
    body: '🔥 Time to focus. What’s your #1 goal today?'
  },
  {
    name: 'Gentle Reminder',
    title: 'DailyPing',
    body: 'Hey friend 👋 Ready to set today’s goal?'
  }
];

export default function AdminPanel() {
  const [pushStatus, setPushStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('Test Push');
  const [body, setBody] = useState('👋 Hello from DailyPing! Push is working.');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleTemplateChange = (templateName) => {
    setSelectedTemplate(templateName);
    const selected = defaultTemplates.find(t => t.name === templateName);
    if (selected) {
      setTitle(selected.title);
      setBody(selected.body);
    }
  };

  const sendTestPush = async () => {
    const token = localStorage.getItem('token');

    try {
      setIsLoading(true);
      setPushStatus('Sending...');

      const res = await axios.post(
        'https://api.dailyping.org/test/send-push',
        { title, body },
        {
          headers: { Authorization: `Bearer ${token}` }
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

      {/* Template selector */}
      <div className="mb-3">
        <label className="form-label">Use a Template</label>
        <select
          className="form-select"
          value={selectedTemplate}
          onChange={(e) => handleTemplateChange(e.target.value)}
        >
          <option value="">-- Choose a Template --</option>
          {defaultTemplates.map((t) => (
            <option key={t.name} value={t.name}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Push Title</label>
        <input
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Push Body</label>
        <textarea
          className="form-control"
          rows={2}
          value={body}
          onChange={(e) => setBody(e.target.value)}
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
