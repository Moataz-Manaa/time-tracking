const express = require("express");
const authController = require("./../controllers/AuthController");

const router = express.Router();

router.post("/signup", authController.signup);

router.post("/login", authController.login);

module.exports = router;
