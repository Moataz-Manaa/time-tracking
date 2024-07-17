const Task = require("../models/task");
const Project = require("../models/project");

exports.addTask = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      user: req.user._id,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const newTask = await Task.create({
      title: req.body.title,
      duration: req.body.duration,
      Date: req.body.Date,
      projectId,
    });

    await Project.findByIdAndUpdate(
      { _id: projectId },
      { $push: { tasks: newTask._id } }
    );

    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findByIdAndUpdate(taskId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) {
      return res.status(404).send("Task not found");
    }
    res.send(task);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const task = await Task.findByIdAndDelete({ _id: taskId, projectId });
    if (!task) {
      return res.status(404).send("Task not found");
    }
    // Remove the task from the project's tasks array
    await Project.findByIdAndUpdate(projectId, { $pull: { tasks: taskId } });
    res.send("Task deleted");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ projectId });
    if (!tasks.length) {
      return res.status(404).send("No tasks found for this project");
    }
    res.send(tasks);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getAllTasksForUser = async (req, res) => {
  try {
    // Find all projects for the logged-in user
    const projects = await Project.find({ user: req.user._id });
    // Extract project IDs
    const projectIds = projects.map((project) => project._id);
    // Find all tasks that belong to the user's projects
    const tasks = await Task.find({ projectId: { $in: projectIds } });

    res.status(200).json({
      status: "success",
      data: tasks,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getTasksByDate = async (req, res) => {
  try {
    const { date } = req.params;
    // Convert date string to Date object and set the start and end of the day
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1); // Move to the next day
    // Set time to the beginning of the start date and end date
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    // Find tasks created on the specific day
    const tasks = await Task.find({
      Date: {
        $gte: startDate,
        $lt: endDate,
      },
    });
    if (!tasks.length) {
      return res.status(404).send("No tasks found for this date");
    }

    res.status(200).json({
      status: "success",
      data: tasks,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
