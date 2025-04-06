// components/ReminderForm.jsx
import React from 'react';

export default function ReminderForm({ reminders, setReminders }) {
  const addReminder = () => setReminders([...reminders, ""]);
  const updateReminder = (idx, value) => {
    const newReminders = [...reminders];
    newReminders[idx] = value;
    setReminders(newReminders);
  };
  const removeReminder = (idx) => {
    const newReminders = [...reminders];
    newReminders.splice(idx, 1);
    setReminders(newReminders);
  };

  return (
    <div className="mb-3">
      <label className="form-label"></label>
      {reminders.map((r, i) => (
        <div key={i} className="d-flex mb-1">
          <input
            type="time"
            className="form-control"
            value={r}
            onChange={(e) => updateReminder(i, e.target.value)}
          />
          <button type="button" className="btn btn-outline-danger ms-2" onClick={() => removeReminder(i)}>✕</button>
        </div>
      ))}
      <button type="button" className="btn btn-outline-secondary btn-sm mt-2" onClick={addReminder}>
        ➕ Add Reminder
      </button>
    </div>
  );
}
