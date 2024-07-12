import React, { useState, useEffect } from "react";
import axios from "axios";

const CreateTask = () => {
  const [taskTitle, setTaskTitle] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timerInput, setTimerInput] = useState("00:00:00");
  const [isRunning, setIsRunning] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [timerStartTime, setTimerStartTime] = useState(null);
  const [timerIntervalId, setTimerIntervalId] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:3000/api/v1/projects",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProjects(response.data.data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    let interval;
    if (isRunning && activeTaskId) {
      setTimerStartTime(new Date()); // Set timerStartTime when the timer starts
      interval = setInterval(() => {
        setTimerStartTime(new Date()); // Update timerStartTime every second
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === activeTaskId
              ? {
                  ...task,
                  duration: (task.duration || 0) + 1,
                }
              : task
          )
        );
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, activeTaskId]);

  const convertToSeconds = (timeString) => {
    const [hrs, mins, secs] = timeString.split(":").map(Number);
    return hrs * 3600 + mins * 60 + secs;
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const task = {
        projectId: selectedProject,
        title: taskTitle,
        Date: new Date(),
        duration: convertToSeconds(timerInput),
      };
      const response = await axios.post(
        `http://localhost:3000/api/v1/projects/${selectedProject}/tasks`,
        task,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Logging the entire response to debug
      console.log("API Response:", response);

      const newTask = { ...task, _id: response.data._id }; // Corrected path to access _id
      setTasks([...tasks, newTask]);
      setTaskTitle("");
      setTimerInput("00:00:00");
    } catch (error) {
      console.error("Error submitting task:", error);
    }
  };

  const handleDelete = async (task) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:3000/api/v1/projects/${task.projectId}/tasks/${task._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTasks(tasks.filter((t) => t._id !== task._id));
      if (task._id === activeTaskId) {
        setIsRunning(false);
        setActiveTaskId(null);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleStart = (taskId) => {
    setIsRunning(true);
    setActiveTaskId(taskId);
    setTimerStartTime(new Date());
  };

  const handleStop = async () => {
    try {
      const token = localStorage.getItem("token");
      const task = tasks.find((t) => t._id === activeTaskId);
      const elapsedTime = Math.floor(
        (new Date() - new Date(timerStartTime)) / 1000
      );
      const updatedTask = {
        ...task,
        duration: (task.duration || 0) + elapsedTime,
      };
      await axios.patch(
        `http://localhost:3000/api/v1/projects/${task.projectId}/tasks/${activeTaskId}`,
        updatedTask,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTasks(tasks.map((t) => (t._id === activeTaskId ? updatedTask : t)));
      setIsRunning(false);
      setActiveTaskId(null);
    } catch (error) {
      console.error("Error stopping task:", error);
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

  const fetchTasksForProject = async (projectId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3000/api/v1/projects/${projectId}/tasks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTasks(response.data.data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <input
          type="text"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="Enter task title"
          className="p-2 border rounded w-full mb-2"
        />
        <select
          value={selectedProject}
          onChange={(e) => {
            setSelectedProject(e.target.value);
            fetchTasksForProject(e.target.value);
          }}
          className="p-2 border rounded w-full mb-2"
        >
          <option value="">Select project</option>
          {projects.length > 0 ? (
            projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.projectName}
              </option>
            ))
          ) : (
            <option value="">No projects available</option>
          )}
        </select>
        <div className="mb-2">
          <input
            type="text"
            value={timerInput}
            onChange={(e) => setTimerInput(e.target.value)}
            className="p-2 border rounded w-full mb-2"
          />
        </div>
        <div>
          <button
            onClick={handleSubmit}
            className="p-2 bg-purple-500 text-white rounded"
          >
            Add
          </button>
        </div>
      </div>
      <table className="min-w-full border-collapse block md:table">
        <thead className="block md:table-header-group">
          <tr className="border border-grey-500 md:border-none block md:table-row absolute -top-full md:top-auto -left-full md:left-auto md:relative">
            <th className="bg-gray-200 p-2 text-left md:border md:border-grey-500 block md:table-cell">
              Project
            </th>
            <th className="bg-gray-200 p-2 text-left md:border md:border-grey-500 block md:table-cell">
              Task Title
            </th>
            <th className="bg-gray-200 p-2 text-left md:border md:border-grey-500 block md:table-cell">
              Duration
            </th>
            <th className="bg-gray-200 p-2 text-left md:border md:border-grey-500 block md:table-cell">
              Date
            </th>
            <th className="bg-gray-200 p-2 text-left md:border md:border-grey-500 block md:table-cell">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="block md:table-row-group">
          {tasks.length > 0 ? (
            tasks.map((task) => {
              const project = projects.find(
                (project) => project._id === task.projectId
              );
              return (
                <tr
                  key={task._id}
                  className="bg-gray-100 border border-grey-500 md:border-none block md:table-row"
                >
                  <td className="p-2 md:border md:border-grey-500 text-left block md:table-cell">
                    {project ? project.projectName : "Unknown Project"}
                  </td>
                  <td className="p-2 md:border md:border-grey-500 text-left block md:table-cell">
                    {task.title}
                  </td>
                  <td className="p-2 md:border md:border-grey-500 text-left block md:table-cell">
                    {activeTaskId === task._id && isRunning
                      ? formatTime(
                          (task.duration || 0) +
                            Math.floor(
                              (new Date() - new Date(timerStartTime)) / 1000
                            )
                        )
                      : formatTime(task.duration || 0)}
                  </td>
                  <td className="p-2 md:border md:border-grey-500 text-left block md:table-cell">
                    {new Date(task.Date).toLocaleDateString()}
                  </td>
                  <td className="p-2 md:border md:border-grey-500 text-left block md:table-cell">
                    <button
                      onClick={() => handleDelete(task)}
                      className="p-2 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                    {activeTaskId === task._id && isRunning ? (
                      <button
                        onClick={handleStop}
                        className="p-2 bg-yellow-500 text-white rounded ml-2"
                      >
                        Stop
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStart(task._id)}
                        className="p-2 bg-blue-500 text-white rounded ml-2"
                      >
                        Start
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" className="p-2 text-center">
                No tasks available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CreateTask;
