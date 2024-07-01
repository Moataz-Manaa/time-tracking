const User = require("../models/user");
const Project = require("../models/project");

exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("projects");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ status: "success", data: user });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.updateUserInfo = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).populate("projects");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ status: "success", data: user });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate("projects");
    res.status(200).json({ status: "success", data: users });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Find and delete projects associated with the user
    const projects = await Project.find({ user: user._id });
    for (const project of projects) {
      await Project.findByIdAndDelete(project._id);
    }
    // Delete the user
    await User.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "User and associated projects and tasks deleted!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
