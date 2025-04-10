// src/pages/Projects.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("https://api.dailyping.org/api/projects", {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Filter to only show projects the user is a contributor on
        const users = (res.data.users)
        console.log(users)
        const userProjects = res.data.filter(p => p.users.includes(user.username));
        setProjects(userProjects);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };

    if (user?.username) {
      fetchProjects();
    }
  }, [user]);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Your Projects</h2>
        <Link to="/projects/new" className="btn btn-primary">+ New Project</Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-muted">You don’t have any projects yet.</p>
      ) : (
        projects.map(project => (
          <div className="card mb-3" key={project._id}>
            <div className="card-body">
              <h5>{project.title}</h5>
              <p className="text-muted">{project.description}</p>
              <Link to={`/projects/${project._id}`} className="btn btn-outline-primary btn-sm">View</Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
