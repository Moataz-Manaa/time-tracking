import React, { useState, useEffect } from "react";
import axios from "axios";

const CreateProject = () => {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState(null);

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

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const token = localStorage.getItem("token");
      const project = {
        projectName,
        totalDuration: 0,
      };
      const response = await axios.post(
        "http://localhost:3000/api/v1/projects",
        project,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProjects([...projects, project]);
      setProjectName("");
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

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

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto max-w-7xl p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex items-center">
            <label className="block text-gray-700 mr-4">Project Name</label>
            <input
              type="text"
              className=" p-2 border border-gray-300 rounded mt-1"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className=" py-2 px-4 bg-green-600 text-white rounded"
          >
            Create Project
          </button>
        </form>
      </div>
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full border-collapse block md:table mx-auto">
          <thead className="block md:table-header-group">
            <tr className="border border-grey-500 md:border-none block md:table-row absolute -top-full md:top-auto -left-full md:left-auto md:relative ">
              <th className="bg-gray-600 p-2 text-white font-bold md:border md:border-grey-500 text-left block md:table-cell">
                Project Name
              </th>
              <th className="bg-gray-600 p-2 text-white font-bold md:border md:border-grey-500 text-left block md:table-cell">
                Total Duration
              </th>
              <th className="bg-gray-600 p-2 text-white font-bold md:border md:border-grey-500 text-left block md:table-cell">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="block md:table-row-group">
            {projects.map((project) => (
              <tr
                key={`${project._id}_${project.projectName}`}
                className="bg-gray-300 border border-grey-500 md:border-none block md:table-row"
              >
                <td className="p-2 md:border md:border-grey-500 text-left block md:table-cell">
                  {project.projectName}
                </td>
                <td className="p-2 md:border md:border-grey-500 text-left block md:table-cell">
                  {formatTime(project.totalDuration)}
                </td>
                <td className="p-2 md:border md:border-grey-500 text-left block md:table-cell">
                  <button
                    onClick={() => handleDelete(project)}
                    className="p-2 text-red-600"
                  >
                    delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreateProject;
