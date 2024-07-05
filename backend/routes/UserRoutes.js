const express = require("express");
const authController = require("../controllers/AuthController");
const userController = require("../controllers/UserController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/logout", authController.logout);

router.use(authController.protect);

router.get("/me", userController.getUserInfo);
router.patch("/me", userController.updateUserInfo);

router.use(authController.restrictTo("admin"));

router.get("/", userController.getAllUsers);
router.delete("/:id", userController.deleteUser);

module.exports = router;
