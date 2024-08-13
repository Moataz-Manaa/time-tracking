const express = require("express");
const authController = require("../controllers/AuthController");
const userController = require("../controllers/UserController");

const router = express.Router();

router.get("/activate/:activationCode", authController.activateAccount);
router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.use(authController.protect);
router.get("/me", userController.getUserInfo);
router.patch("/me", userController.updateUserInfo);
router.patch("/updateMyPassword", authController.updatePassword);

router.use(authController.restrictTo("admin"));

router.get("/", userController.getAllUsers);

module.exports = router;
