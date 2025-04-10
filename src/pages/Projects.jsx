// src/pages/Projects.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Projects() {
  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Your Projects</h2>
        <Link to="/projects/new" className="btn btn-primary">+ New Project</Link>
      </div>

      {/* Project cards will go here */}
      <div className="card mb-3">
        <div className="card-body">
          <h5>Example Project</h5>
          <p className="text-muted">This is a short description of the project.</p>
          <Link to="/projects/123" className="btn btn-outline-primary btn-sm">View</Link>
        </div>
      </div>
    </div>
  );
}
