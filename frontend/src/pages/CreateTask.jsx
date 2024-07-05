// src/pages/CreateTask.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateTask = () => {
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    projectId: "",
  });
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the user's projects to display in the dropdown
    const fetchProjects = async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3000/api/v1/projects",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProjects(response.data.data);
    };
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:3000/api/v1/projects/" +
          taskData.projectId +
          "/tasks",
        taskData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate("/projects");
    } catch (error) {
      console.error("Error creating task:", error.response.data.message);
    }
  };

  return (
    <div className="flex flex-col items-center p-8">
      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Create Task</h2>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-bold mb-2">
            Title:
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={taskData.title}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-gray-700 font-bold mb-2"
          >
            Description:
          </label>
          <textarea
            id="description"
            name="description"
            value={taskData.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="startTime"
            className="block text-gray-700 font-bold mb-2"
          >
            Start Time:
          </label>
          <input
            type="datetime-local"
            id="startTime"
            name="startTime"
            value={taskData.startTime}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="endTime"
            className="block text-gray-700 font-bold mb-2"
          >
            End Time:
          </label>
          <input
            type="datetime-local"
            id="endTime"
            name="endTime"
            value={taskData.endTime}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="projectId"
            className="block text-gray-700 font-bold mb-2"
          >
            Project:
          </label>
          <select
            id="projectId"
            name="projectId"
            value={taskData.projectId}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.projectName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Create Task
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;
