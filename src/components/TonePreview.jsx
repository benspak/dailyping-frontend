// src/components/TonePreview.jsx
import React, { useState } from 'react';
import './TonePreview.css'; // Optional: for styling

const TONE_SAMPLES = {
  gentle: {
    label: 'Gentle',
    html: `
      <h2>Hi there,</h2>
      <p>What’s your #1 goal today?</p>
      <p>Take a moment to reflect and set your intention. You’ve got this. 💙</p>
    `
  },
  motivational: {
    label: 'Motivational',
    html: `
      <h2>Let’s crush today 💪</h2>
      <p>What’s your #1 goal? Set it, chase it, own it.</p>
      <p>The best version of you is one task away.</p>
    `
  },
  snarky: {
    label: 'Snarky',
    html: `
      <h2>Oh hey. You again.</h2>
      <p>What’s your goal today? Hopefully not “nap until tomorrow.”</p>
      <p>Let’s get it together, champ. 🐢</p>
    `
  }
};

export default function TonePreview({ selectedTone, onToneChange }) {
  const [tone, setTone] = useState(selectedTone || 'gentle');

  const handleToneSelect = (t) => {
    setTone(t);
    onToneChange?.(t);
  };

  return (
    <div className="tone-preview">
      <h5 className="mb-3">📬 Preview Your Ping Style</h5>
      <div className="btn-group mb-3">
        {Object.entries(TONE_SAMPLES).map(([key, { label }]) => (
          <button
            key={key}
            className={`btn btn-sm ${tone === key ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={() => handleToneSelect(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="preview-card border rounded p-3 bg-light" style={{ fontFamily: 'sans-serif' }}>
        <div dangerouslySetInnerHTML={{ __html: TONE_SAMPLES[tone].html }} />
        <a
          href="https://dailyping.org/respond"
          className="btn btn-sm btn-primary mt-3"
        >
          Respond Now
        </a>
      </div>
    </div>
  );
}
