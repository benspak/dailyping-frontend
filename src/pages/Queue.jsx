import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Queue() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const fetchQueue = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://api.dailyping.org/api/queue", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data);
    };

    if (user?.username) fetchQueue();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const userId = user.id;
    const payload = { userId, title, note };
    console.log(user)
    console.log(userId)
    console.log(payload)
    try {
      // console.log("Submitting payload:", payload);
      const res = await axios.post("https://api.dailyping.org/api/queue", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems([res.data, ...items]);
      setTitle("");
      setNote("");
    } catch (err) {
      console.error("Error submitting queue item:", err);
    }
  };

  return (
    <div className="container py-5">
      <h2>Goal Backlog</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Notes</label>
          <textarea className="form-control" value={note} onChange={e => setNote(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary">Add to Queue</button>
      </form>

      <ul className="list-group">
        {items.map(item => (
          <li key={item._id} className="list-group-item">
            <h5 className="mb-1">{item.title}</h5>
            {item.note && <p className="mb-1 text-muted">{item.note}</p>}
            <button className="btn btn-sm btn-outline-success">Convert to Goal</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
