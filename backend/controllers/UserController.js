const User = require("../models/user");

exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
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
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    });
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
