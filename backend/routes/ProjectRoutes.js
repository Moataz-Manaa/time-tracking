const express = require("express");
const router = express.Router();
const ProjectController = require("./../controllers/ProjectController");
const TaskController = require("./../controllers/TaskController");

router.route("/add").post(ProjectController.addProject);

router.route("/").get(ProjectController.getProjects);

router.route("/:id").get(ProjectController.getOneProject);

router.route("/:id").delete(ProjectController.deleteProject);

router.route("/:id").patch(ProjectController.updateProject);

router.route("/:projectId/tasks").post(TaskController.addTask);

router.route("/:projectId/tasks/:taskId").patch(TaskController.updateTask);

router.route("/:projectId/tasks/:taskId").delete(TaskController.deleteTask);

router.route("/:projectId/tasks/").get(TaskController.getTask);

module.exports = router;
