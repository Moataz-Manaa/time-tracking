const Project = require("../models/project");
const User = require("../models/user");
const Task = require("../models/task");
const crypto = require("crypto");
const { sendJoinEmail } = require("../utils/email");

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

    // Generate a join token for each email
    const joinTokens = sharedEmails.map((email) => {
      const token = crypto.randomBytes(32).toString("hex");
      return { token, email };
    });

    // Update the project with the join tokens
    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        $addToSet: { sharedWith: { $each: sharedWithIds } },
        $push: { joinTokens: { $each: joinTokens } },
      },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    /*
    joinTokens.forEach(({ token, email }) => {
      const joinUrl = `http://localhost:5173/join-project/${token}?projectId=${projectId}`;
      sendJoinEmail(email, joinUrl);
    });*/

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
    }).populate("user sharedWith userDurations.user");
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
      .populate("user", "firstName lastName email")
      .populate("sharedWith", "firstName lastName email");
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
      .populate("userDurations.user", "firstName lastName email");

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
/*
exports.joinProject = async (req, res) => {
  try {
    const { token, projectId } = req.body;

    // Find the project with the provided projectId and token
    const project = await Project.findOne({
      _id: projectId,
      "joinTokens.token": token,
    });

    if (!project) {
      return res.status(404).json({ message: "Invalid or expired token" });
    }

    const user = req.user;
    // Add the user to the project if not already part of it
    if (!project.sharedWith.includes(user._id)) {
      project.sharedWith.push(user._id);
    }

    // Remove the used token
    project.joinTokens = project.joinTokens.filter((t) => t.token !== token);
    await project.save();

    // Add the project to the user's project list if not already added
    if (!user.projects.includes(project._id)) {
      user.projects.push(project._id);
      await user.save();
    }

    res.status(200).json({ message: "Project joined successfully" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};*/
