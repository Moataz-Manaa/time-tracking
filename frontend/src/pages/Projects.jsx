import React, { useEffect, useState } from "react";
import axios from "axios";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
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

  const handleDelete = async (project) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:3000/api/v1/projects/${project._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProjects(projects.filter((p) => p._id !== project._id));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl p-8 bg-white rounded-xl shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center">Projects</h2>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <ul className="space-y-4">
          {projects.map((project) => (
            <li
              key={project._id}
              className="px-4 py-2 border rounded-md flex justify-between items-center"
            >
              <h3 className="text-lg font-semibold">{project.projectName}</h3>
              <button
                onClick={() => handleDelete(project)}
                className="p-2 text-red-600"
              >
                delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Projects;
