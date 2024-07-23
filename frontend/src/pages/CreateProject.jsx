import React, { useState, useEffect } from "react";
import axios from "axios";

const CreateProject = () => {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [sharedEmails, setSharedEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [userId, setUserId] = useState("");

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

        // Assuming the token contains the user ID in its payload
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setUserId(decodedToken.id);
      } catch (err) {
        setError(err.response.data.message);
      }
    };

    fetchProjects();
  }, []);

  const handleEmailAdd = () => {
    const emails = emailInput.split(" ").map((email) => email.trim());
    const newEmails = emails.filter(
      (email) => email && !sharedEmails.includes(email)
    );
    setSharedEmails([...sharedEmails, ...newEmails]);
    setEmailInput("");
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

  const handleEmailRemove = (emailToRemove) => {
    setSharedEmails(sharedEmails.filter((email) => email !== emailToRemove));
  };

  const handleShareSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/v1/projects/share",
        { projectId: selectedProject._id, sharedEmails },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShowOverlay(false);
      setSharedEmails([]);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const token = localStorage.getItem("token");
      const project = {
        projectName,
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
      setProjects([...projects, response.data.project]);
      setProjectName("");
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
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
              className="p-2 border border-gray-300 rounded mt-1"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="py-2 px-4 bg-green-600 text-white rounded"
          >
            Create Project
          </button>
        </form>
      </div>
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full border-collapse block md:table mx-auto text-center text-xl">
          <thead className="block md:table-header-group">
            <tr className="border border-grey-500 md:border-none block md:table-row absolute -top-full md:top-auto -left-full md:left-auto md:relative ">
              <th className="bg-gray-600 p-2 text-white font-bold md:border md:border-grey-500">
                Project Name
              </th>
              <th className="bg-gray-600 p-2 text-white font-bold md:border md:border-grey-500">
                Total Duration
              </th>
              <th className="bg-gray-600 p-2 text-white font-bold md:border md:border-grey-500">
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
                <td className="p-2 md:border md:border-grey-500">
                  {project.projectName}
                </td>
                <td className="p-2 md:border md:border-grey-500">
                  {formatTime(project.totalDuration)}
                </td>
                <td className="p-2 md:border md:border-grey-500">
                  <button
                    onClick={() => handleDelete(project)}
                    className="py-2 px-4 text-white	bg-red-600 rounded"
                    disabled={project.user !== userId}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setShowOverlay(true);
                    }}
                    className="ml-2 py-2 px-4 bg-blue-600 text-white rounded"
                    disabled={project.user !== userId}
                  >
                    Share With
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showOverlay && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-1/3">
            <h2 className="text-2xl font-bold mb-4">Share Project</h2>
            <div className="mb-4">
              <label className="block mb-2">Share with (Emails)</label>
              <div className="flex items-center">
                <input
                  type="text"
                  className="p-2 border border-gray-300 rounded mt-1 w-full"
                  placeholder="Enter emails separated by space"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
                <button
                  type="button"
                  className="ml-2 py-2 px-4 bg-blue-600 text-white rounded"
                  onClick={handleEmailAdd}
                >
                  Add
                </button>
              </div>
            </div>
            <div className="mb-4">
              {sharedEmails.map((email) => (
                <div key={email} className="flex items-center mb-2">
                  <span className="mr-2">{email}</span>
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => handleEmailRemove(email)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="mr-2 py-2 px-4 bg-gray-600 text-white rounded"
                onClick={() => {
                  setShowOverlay(false);
                  setSharedEmails([]);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="py-2 px-4 bg-green-600 text-white rounded"
                onClick={handleShareSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProject;
