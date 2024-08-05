const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { sendConfirmationEmail } = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: true,
    httpOnly: true,
  });

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res) => {
  const characters =
    "0123456789azertyuiopqsdfghjklmwxcvbnAZERTYUIOPQSDFGHJKLMWXCVBN";
  let activationCode = "";
  for (let i = 0; i < 25; i++) {
    activationCode += characters[Math.floor(Math.random() * characters.length)];
  }
  try {
    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
      activationCode: activationCode,
    });
    sendConfirmationEmail(newUser.email, activationCode);
    res.status(201).json({
      status: "success",
      message: "User created. Please check your email for activation link.",
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    if (
      user &&
      (await user.correctPassword(password, user.password)) &&
      !user.active
    ) {
      return res
        .status(401)
        .json({ message: "please check your email for activation" });
    }

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ message: "Successfully logged out" });
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "You are not logged in! Please log in to get access.",
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        message: "The user belonging to this token does no longer exist.",
      });
    }
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .send("You do not have permission to perform this action");
    }
    next();
  };
};

exports.activateAccount = async (req, res) => {
  try {
    const { activationCode } = req.params;

    const user = await User.findOneAndUpdate(
      { activationCode },
      { active: true, activationCode: undefined },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ message: "Invalid activation code" });
    }

    res.status(200).json({ message: "Account activated successfully" });
  } catch (err) {
    console.error("Error activating account:", err); // Log the error for debugging
    res
      .status(500)
      .send({ message: "An error occurred while activating the account." });
  }
};
