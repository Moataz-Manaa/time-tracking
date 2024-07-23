const express = require("express");
const ProjectController = require("../controllers/ProjectController");
const TaskController = require("../controllers/TaskController");
const authController = require("../controllers/AuthController");

const router = express.Router();

router.use(authController.protect);

router.get("/user-tasks", TaskController.getAllTasksForUser);
router.get("/tasks/date/:date", TaskController.getTasksByDate);
router.post("/", ProjectController.addProject);
router.post("/share", ProjectController.shareProject);
router.get("/", ProjectController.getProjects);
router.get("/:id", ProjectController.getOneProject);
router.patch("/:id", ProjectController.updateProject);
router.delete("/:id", ProjectController.deleteProject);

router.post("/:projectId/tasks", TaskController.addTask);
router.get("/:projectId/tasks", TaskController.getTasks);
router.patch("/:projectId/tasks/:taskId", TaskController.updateTask);
router.delete("/:projectId/tasks/:taskId", TaskController.deleteTask);
module.exports = router;
