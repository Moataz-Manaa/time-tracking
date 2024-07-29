const Task = require("../models/task");
const Project = require("../models/project");

exports.addTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = new Task({
      ...req.body,
      project: projectId,
      user: req.user._id,
    });
    await task.save();

    // Update user duration in the project
    const userDurationIndex = project.userDurations.findIndex(
      (ud) => ud.user.toString() === req.user._id.toString()
    );
    if (userDurationIndex !== -1) {
      project.userDurations[userDurationIndex].duration += task.duration;
    } else {
      project.userDurations.push({
        user: req.user._id,
        duration: task.duration,
      });
    }

    await project.save();

    res.status(201).json({ task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).send("Task not found");
    }

    const oldDuration = task.duration;
    const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, {
      new: true,
      runValidators: true,
    });

    const project = await Project.findById(updatedTask.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Update user duration in the project
    const userDurationIndex = project.userDurations.findIndex(
      (ud) => ud.user.toString() === req.user._id.toString()
    );
    const durationDifference = updatedTask.duration - oldDuration;

    if (userDurationIndex !== -1) {
      project.userDurations[userDurationIndex].duration += durationDifference;
    } else {
      project.userDurations.push({
        user: req.user._id,
        duration: updatedTask.duration,
      });
    }

    await project.save();

    res.send(updatedTask);
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
    const projects = await Project.find({ user: req.user._id });
    const projectIds = projects.map((project) => project._id);

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
      user: req.user._id,
      Date: {
        $gte: startDate,
        $lt: endDate,
      },
    });
    if (!tasks.length) {
      return res.status(404).send("No tasks found for this date");
    }

    const totalDuration = tasks.reduce(
      (total, task) => total + task.duration,
      0
    );

    res.status(200).json({
      status: "success",
      data: {
        tasks,
        totalDuration,
      },
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
