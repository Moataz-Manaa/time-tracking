const Project = require("../models/project");

exports.addProject = async (req, res) => {
  try {
    const newProject = {
      projectName: req.body.projectName,
    };
    const project = await Project.create(newProject);
    res.status(201).json({ message: "Project added!", project });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("tasks");
    res.status(200).json({
      status: "success",
      data: projects,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getOneProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).populate("tasks");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({
      status: "success",
      data: project,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);
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
    const project = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("tasks");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ message: "Project updated successfully!", project });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
