const Project = require("../models/project");
const User = require("../models/user");

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
    const project = await Project.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ message: "Project deleted!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOneAndUpdate(
      { _id: id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate("tasks");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ message: "Project updated successfully!", project });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
