import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext"

export default function ProjectForm() {
  const { user } = useAuth;
  const { projectId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(projectId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goals, setGoals] = useState([]);
  const [selectedGoalIds, setSelectedGoalIds] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchGoals = async () => {
      const res = await axios.get("https://api.dailyping.org/api/responses/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(res.data);
    };

    const fetchProject = async () => {
      const res = await axios.get(`https://api.dailyping.org/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { title, description, goalIds } = res.data;
      setTitle(title);
      setDescription(description);
      setSelectedGoalIds(goalIds);
    };

    fetchGoals();
    if (isEditing) fetchProject();
  }, [projectId, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const userId = user._id;
    const payload = { title, description, goalIds: selectedGoalIds, userId };

    if (isEditing) {
      console.log(`Edit projects: ${payload}`)
      await axios.put(`https://api.dailyping.org/api/projects/${projectId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } else {
      console.log(user)
      console.log("Handel Submit working ...")
      await axios.post("https://api.dailyping.org/api/projects", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    navigate("/projects");
  };

  return (
    <div className="container py-5">
      <h2>{isEditing ? "Edit Project" : "New Project"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="form-label">Select Goals</label>
          {goals.map(goal => (
            <div key={goal._id} className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id={`goal-${goal._id}`}
                checked={selectedGoalIds.includes(goal._id)}
                onChange={(e) => {
                  setSelectedGoalIds(prev =>
                    e.target.checked
                      ? [...prev, goal._id]
                      : prev.filter(id => id !== goal._id)
                  );
                }}
              />
              <label className="form-check-label" htmlFor={`goal-${goal._id}`}>
                {goal.content}
              </label>
            </div>
          ))}
        </div>
        <button type="submit" className="btn btn-success">
          {isEditing ? "Update Project" : "Create Project"}
        </button>
      </form>
    </div>
  );
}
