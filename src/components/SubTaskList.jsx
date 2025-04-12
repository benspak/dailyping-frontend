import React from 'react';

export default function SubTaskList({ goal, onToggle }) {
  const handleChange = (index) => {
    const updated = [...goal.subTasks];
    updated[index].checked = !updated[index].checked;
    onToggle(goal._id, updated);
  };

  return (
    <ul className="list-group mt-2">
      {goal.subTasks?.map((task, i) => (
        <li key={i} className="list-group-item d-flex align-items-center">
          <input
            type="checkbox"
            className="form-check-input me-2"
            checked={task.checked}
            onChange={() => handleChange(i)}
          />
          <span style={{ textDecoration: task.checked ? 'line-through' : 'none' }}>
            {task.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
