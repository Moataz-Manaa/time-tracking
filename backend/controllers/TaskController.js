const Task = require("../models/task");
const Project = require("../models/project");

exports.addTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    const newTask = {
      title: req.body.title,
      description: req.body.description,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      projectId,
    };
    const task = await Task.create(newTask);
    project.tasks.push(task._id);
    await project.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const updates = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: taskId, projectId },
      updates,
      { new: true, runValidators: true }
    );
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
    const task = await Task.findOneAndDelete({ _id: taskId, projectId });
    if (!task) {
      return res.status(404).send("Task not found");
    }

    res.send("Task deleted");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ projectId });
    if (!tasks) {
      return res.status(404).send("No tasks found for this project");
    }
    res.send(tasks);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
