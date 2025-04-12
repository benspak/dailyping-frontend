import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function QueueItem() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    const fetchQueue = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://api.dailyping.org/api/queue", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setItems(sorted);
    };

    if (user?.username) fetchQueue();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const payload = { title, note, dueDate };
    try {
      const res = await axios.post("https://api.dailyping.org/api/queue", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems([res.data, ...items]);
      setTitle("");
      setNote("");
      setDueDate("");
    } catch (err) {
      console.error("Error submitting queue item:", err);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`https://api.dailyping.org/api/queue/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      if (err.response?.status === 404) {
        console.warn("Item not found on server. Removing from UI.");
        setItems(prev => prev.filter(item => item._id !== id)); // still remove from UI
      } else {
        console.error("Error deleting queue item:", err);
      }
    }
  };

  return (
    <div className="container py-5">
      <h2>Queue</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Note</label>
          <textarea className="form-control" value={note} onChange={e => setNote(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Due Date</label>
          <input
            type="date"
            className="form-control"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Add to Queue</button>
      </form>

      <ul className="list-group">
        {items.map(item => (
          <li key={item._id} className="list-group-item">
            <button
              className="btn btn-sm btn-outline-danger float-end"
              onClick={() => handleDelete(item._id)}
            >
              ×
            </button>
            <h5 className="mb-1">{item.title}</h5>
            {item.dueDate && (
              <p className="mb-1"><strong>Due:</strong> {new Date(item.dueDate).toLocaleDateString()}</p>
            )}
            {item.note && <p className="mb-1 text-muted">{item.note}</p>}
            <button className="btn btn-sm btn-outline-success">Convert to Goal</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
