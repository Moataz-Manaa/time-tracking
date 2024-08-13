const Project = require("../models/project");
const User = require("../models/user");
const Task = require("../models/task");
const crypto = require("crypto");

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

exports.shareProject = async (req, res) => {
  try {
    const { projectId, sharedEmails } = req.body;
    const usersToShareWith = await User.find({ email: { $in: sharedEmails } });
    const sharedWithIds = usersToShareWith.map((user) => user._id);
    // Update the project with the join tokens
    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        $addToSet: { sharedWith: { $each: sharedWithIds } },
      },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    // Add project to the shared users' project lists
    await User.updateMany(
      { _id: { $in: sharedWithIds } },
      { $addToSet: { projects: project._id } }
    );
    res.status(200).json({ message: "Project shared!", project });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ user: req.user._id }, { sharedWith: req.user._id }],
    });
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
      $or: [{ user: req.user._id }, { sharedWith: req.user._id }],
    });
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
    const updatedProject = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("tasks");
    if (!updatedProject) {
      return res.status(404).json({
        message: "Project not found",
      });
    }
    res.status(200).json({
      message: "Project updated successfully!",
      project: updatedProject,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getAllProjectDetails = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("user")
      .populate("sharedWith")
      .populate("tasks");
    if (!projects.length) {
      return res.status(404).json({ message: "No projects found" });
    }

    res.status(200).json({ status: "success", data: projects });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getMyProjectsAndSharedUsers = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id })
      .populate("user", "firstName lastName email")
      .populate("sharedWith", "firstName lastName email")
      .populate("userDurations.user")
      .populate("tasks");

    if (!projects.length) {
      return res.status(404).json({ message: "No projects found" });
    }
    // Prepare response data including user durations
    const response = projects.map((project) => {
      const sharedUsersWithDurations = project.sharedWith.map((sharedUser) => {
        const userDuration = project.userDurations.find(
          (ud) => ud.user._id.toString() === sharedUser._id.toString()
        );
        return {
          user: sharedUser,
          duration: userDuration ? userDuration.duration : 0,
        };
      });

      const creatorDuration = project.userDurations.find(
        (ud) => ud.user._id.toString() === project.user._id.toString()
      );

      return {
        _id: project._id,
        projectName: project.projectName,
        totalDuration: project.totalDuration,
        tasks: project.tasks,
        creator: {
          user: project.user,
          duration: creatorDuration ? creatorDuration.duration : 0,
        },
        sharedUsersWithDurations,
      };
    });

    res.status(200).json({ status: "success", data: response });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
