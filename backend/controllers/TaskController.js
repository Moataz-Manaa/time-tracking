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
      description: req.body.description,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      projectId,
    });

    project.tasks.push(newTask._id);
    await project.save();

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
