import React, { useEffect, useState } from "react";
import axios from "axios";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:3000/api/v1/projects",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProjects(response.data.data);
      } catch (err) {
        setError(err.response.data.message);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl p-8 bg-white rounded-xl shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center">Projects</h2>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <ul className="space-y-4">
          {projects.map((project) => (
            <li key={project._id} className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold">{project.projectName}</h3>
              <p>{`Created at: ${new Date(
                project.createdAt
              ).toLocaleDateString()}`}</p>
              <p>{`Updated at: ${new Date(
                project.updatedAt
              ).toLocaleDateString()}`}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Projects;
