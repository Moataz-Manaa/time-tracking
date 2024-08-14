import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlay, FaPause, FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import WeekDays from "../components/WeekDays";
import { DateTime } from "luxon";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatDuration } from "../utils";

const CreateTask = () => {
  const [taskTitle, setTaskTitle] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timerInput, setTimerInput] = useState("00:00:00");
  const [isRunning, setIsRunning] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [timerStartTime, setTimerStartTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalDuration, setTotalDuration] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTimerInput, setEditTimerInput] = useState("00:00:00");
  const [loading, setLoading] = useState(true);

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
    const fetchTasksByDate = async (date) => {
      try {
        const token = localStorage.getItem("token");
        const formattedDate = DateTime.fromJSDate(date).toFormat("yyyy-MM-dd");
        const response = await axios.get(
          `http://localhost:3000/api/v1/projects/tasks/date/${formattedDate}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const tasksWithDateObjects = response.data.data.tasks.map((task) => ({
          ...task,
          Date: new Date(task.Date),
        }));
        setTasks(tasksWithDateObjects || []);
        setTotalDuration(response.data.data.totalDuration);
      } catch (error) {
        //console.error("Error fetching tasks for date:", error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasksByDate(selectedDate);
  }, [selectedDate]);

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
                  duration: task.duration + 1,
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

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const token = localStorage.getItem("token");
      const task = {
        projectId: selectedProject,
        title: taskTitle,
        Date: selectedDate,
        duration: convertToSeconds(timerInput),
      };
      const response = await axios.post(
        `http://localhost:3000/api/v1/projects/${selectedProject}/tasks`,
        task,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newTask = { ...task, _id: response.data.task._id };
      setTasks([...tasks, newTask]);
      setTaskTitle("");
      setTimerInput("00:00:00");
      updateTotalDuration([...tasks, newTask]);
      toast.success("Task added successfully!");
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error("Failed to add task.");
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
      const updatedTasks = tasks.filter((t) => t._id !== task._id);
      setTasks(updatedTasks);
      updateTotalDuration(updatedTasks);
      if (task._id === activeTaskId) {
        setIsRunning(false);
        setActiveTaskId(null);
      }
      toast.error("Task deleted !");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task.");
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
        duration: task.duration + elapsedTime,
      };
      await axios.patch(
        `http://localhost:3000/api/v1/projects/${task.projectId}/tasks/${activeTaskId}`,
        updatedTask,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedTasks = tasks.map((t) =>
        t._id === activeTaskId ? updatedTask : t
      );
      setTasks(updatedTasks);
      updateTotalDuration(updatedTasks);
      setIsRunning(false);
      setActiveTaskId(null);
    } catch (error) {
      console.error("Error stopping task:", error);
    }
  };

  const updateTotalDuration = (tasks) => {
    const total = tasks.reduce((acc, task) => acc + task.duration, 0);
    setTotalDuration(total);
  };

  const convertToSeconds = (timeString) => {
    const [hrs, mins, secs] = timeString.split(":").map(Number);
    return hrs * 3600 + mins * 60 + secs;
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const openEditModal = (task) => {
    setEditTask(task);
    setEditTaskTitle(task.title);
    setEditTimerInput(formatDuration(task.duration));
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditTask(null);
    setEditTaskTitle("");
    setEditTimerInput("00:00:00");
    setIsEditModalOpen(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const updatedTask = {
        ...editTask,
        title: editTaskTitle,
        duration: convertToSeconds(editTimerInput),
      };
      await axios.patch(
        `http://localhost:3000/api/v1/projects/${editTask.projectId}/tasks/${editTask._id}`,
        updatedTask,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedTasks = tasks.map((t) =>
        t._id === editTask._id ? updatedTask : t
      );
      setTasks(updatedTasks);
      updateTotalDuration(updatedTasks);
      closeEditModal();
      toast.success("Task updated successfully!");
    } catch (error) {
      console.error("Error editing task:", error);
      toast.error("Failed to update task.");
    }
  };

  return (
    <div className="container mx-auto max-w-7xl p-4">
      <h2 className="text-2xl font-bold mb-6">Create Task</h2>
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
          onChange={(e) => setSelectedProject(e.target.value)}
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
            placeholder="Enter time in HH:MM:SS"
            className="p-2 border rounded w-full mb-2"
          />
        </div>
        <div>
          <button
            onClick={handleSubmit}
            className="p-2 bg-green-600 text-white rounded text-5xl"
          >
            <IoMdAdd />
          </button>
          <p className="text-sm">Track time</p>
        </div>
      </div>
      <WeekDays onDateChange={handleDateChange} />
      {loading ? (
        <div className="text-center mt-8">Loading...</div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full border-collapse block md:table mx-auto">
            <thead className="block md:table-header-group">
              <tr className="border border-grey-500 md:border-none block md:table-row absolute -top-full md:top-auto -left-full md:left-auto md:relative ">
                <th className="bg-gray-600 p-2 text-white font-bold md:border md:border-grey-500 text-left block md:table-cell">
                  Project
                </th>
                <th className="bg-gray-600 p-2 text-white font-bold md:border md:border-grey-500 text-left block md:table-cell">
                  Task Title
                </th>
                <th className="bg-gray-600 p-2 text-white font-bold md:border md:border-grey-500 text-left block md:table-cell">
                  Duration
                </th>
                <th className="bg-gray-600 p-2 text-white font-bold md:border md:border-grey-500 text-left block md:table-cell">
                  Date
                </th>
                <th className="bg-gray-600 p-2 text-white font-bold md:border md:border-grey-500 text-left block md:table-cell">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr
                    key={task._id}
                    className="bg-gray-300 border border-grey-500 md:border-none block md:table-row"
                  >
                    <td className="p-2 md:border md:border-grey-500 text-left block md:table-cell">
                      {
                        projects.find((p) => p._id === task.projectId)
                          ?.projectName
                      }
                    </td>
                    <td className="p-2 md:border md:border-grey-500 text-left block md:table-cell">
                      {task.title}
                    </td>
                    <td className="p-2 md:border md:border-grey-500 text-left block md:table-cell">
                      {formatDuration(task.duration)}
                    </td>
                    <td className="p-2 md:border md:border-grey-500 text-left block md:table-cell">
                      {task.Date.toLocaleDateString()}
                    </td>
                    <td className="p-2 md:border md:border-grey-500 text-left block md:table-cell">
                      {activeTaskId === task._id && isRunning ? (
                        <button
                          onClick={handleStop}
                          className="p-2 mr-1.5 bg-yellow-400 text-white rounded"
                        >
                          <FaPause />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStart(task._id)}
                          className="p-2 mr-1.5 bg-green-600 text-white rounded"
                        >
                          <FaPlay />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(task)}
                        className="p-2 mr-1.5 bg-red-600 text-white rounded"
                      >
                        <MdDelete />
                      </button>
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-2 bg-blue-600 text-white rounded"
                      >
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="p-2 text-center text-gray-500 font-bold"
                  >
                    No tasks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <ToastContainer />

          {isEditModalOpen && (
            <div className="fixed bg-gray-800 bg-opacity-75 inset-0 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-lg w-1/3">
                <h2 className="text-2xl font-bold mb-4">Edit Task</h2>
                <form onSubmit={handleEditSubmit}>
                  <div className="mb-4">
                    <label className="block mb-2">Task Title</label>
                    <input
                      type="text"
                      value={editTaskTitle}
                      onChange={(e) => setEditTaskTitle(e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2">Timer Input</label>
                    <input
                      type="text"
                      value={editTimerInput}
                      onChange={(e) => setEditTimerInput(e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="bg-gray-500 text-white p-2 rounded mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 text-white p-2 rounded"
                    >
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
      {tasks.length > 0 && (
        <div className="mt-4">
          <p>
            <span className="inline-block text-lg font-bold mr-3">Total:</span>
            {formatDuration(totalDuration)}
          </p>
        </div>
      )}
    </div>
  );
};

export default CreateTask;
