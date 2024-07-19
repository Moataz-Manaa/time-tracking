import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlay, FaPause } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import WeekDays from "../components/WeekDays";
import { DateTime } from "luxon";

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
        console.log(`Fetching tasks for date: ${formattedDate}`);
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
        console.log("Fetched tasks:", tasksWithDateObjects);
      } catch (error) {
        console.error("Error fetching tasks for date:", error);
        setTasks([]);
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

      const newTask = { ...task, _id: response.data._id };
      setTasks([...tasks, newTask]);
      setTaskTitle("");
      setTimerInput("00:00:00");
      updateTotalDuration([...tasks, newTask]); // Update total duration
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
      const updatedTasks = tasks.filter((t) => t._id !== task._id);
      setTasks(updatedTasks);
      updateTotalDuration(updatedTasks); // Update total duration
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
      updateTotalDuration(updatedTasks); // Update total duration
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

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const convertToSeconds = (timeString) => {
    const [hrs, mins, secs] = timeString.split(":").map(Number);
    return hrs * 3600 + mins * 60 + secs;
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
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
                    {formatTime(task.duration)}
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
                      className="p-2 bg-red-600 text-white rounded"
                    >
                      <MdDelete />
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
      </div>
      {tasks.length > 0 && (
        <div className="mt-4">
          <p>
            <span className="inline-block text-lg font-bold mr-3">Total:</span>
            {formatTime(totalDuration)}
          </p>
        </div>
      )}
    </div>
  );
};

export default CreateTask;
