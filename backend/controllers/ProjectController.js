const Project = require("../models/project");

// create project
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

// return projects
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

// return one project
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

// delete project
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

// update project
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
