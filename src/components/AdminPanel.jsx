import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminPanel() {
  const [sub, setSub] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('https://api.dailyping.org/admin/push-subscription', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setSub(res.data.pushSubscription))
      .catch(err => setError('Not an admin or error fetching data'));
  }, []);

  const sendTestPush = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('https://api.dailyping.org/test/send-push', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Test push sent!');
    } catch {
      alert('❌ Failed to send push.');
    }
  };

  return (
    <div className="card shadow-sm mt-4 p-4">
      <h5 className="mb-3">🧪 Admin Push Debug</h5>
      {error && <p className="text-danger">{error}</p>}
      {sub ? (
        <>
          <pre style={{ maxHeight: 200, overflow: 'auto' }}>
            {JSON.stringify(sub, null, 2)}
          </pre>
          <button className="btn btn-outline-primary mt-2" onClick={sendTestPush}>
            Send Test Push
          </button>
        </>
      ) : (
        !error && <p>Loading subscription data...</p>
      )}
    </div>
  );
}
