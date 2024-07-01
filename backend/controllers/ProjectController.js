const Project = require("../models/project");
const User = require("../models/user");
const Task = require("../models/task");

exports.addProject = async (req, res) => {
  try {
    const newProject = {
      projectName: req.body.projectName,
      user: req.user._id,
    };
    const project = await Project.create(newProject);
    // Add project to user's project list
    await User.findByIdAndUpdate(req.user._id, {
      $push: { projects: project._id },
    });
    res.status(201).json({ message: "Project added!", project });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id }).populate(
      "tasks"
    );
    res.status(200).json({ status: "success", data: projects });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getOneProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOne({
      _id: id,
      user: req.user._id,
    }).populate("tasks");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ status: "success", data: project });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    // Remove the project ID from the user's projects array
    await User.findByIdAndUpdate(project.user, {
      $pull: { projects: id },
    });
    // Delete all tasks associated with the project
    await Task.deleteMany({ projectId: id });
    // Delete the project
    await Project.findByIdAndDelete(id);
    res.status(200).json({ message: "Project and associated tasks deleted!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }
    const updatedProject = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("tasks");
    res.status(200).json({
      message: "Project updated successfully!",
      project: updatedProject,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
