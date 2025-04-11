import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ProjectView() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchProject = async () => {
      try {
        const res = await axios.get(`https://api.dailyping.org/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProject(res.data);
      } catch (err) {
        console.error("Error loading project:", err);
      }
    };

    fetchProject();
  }, [projectId]);

  if (!project) return <p className="container py-5">Loading...</p>;

  return (
    <div className="container py-5">
      <h2>{project.title}</h2>
      <p className="text-muted">{project.description}</p>

      <h5 className="mt-4">Goals in this project</h5>
      <ul>
        {project.goalIds?.map(goalId => (
          <li key={goalId}>{goalId}</li> // optionally replace with goal content later
        ))}
      </ul>

      <h6 className="mt-4">Contributors:</h6>
      <ul>
        {project.users?.map(username => (
          <li key={username}>{username}</li>
        ))}
      </ul>
    </div>
  );
}
