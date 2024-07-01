const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const app = express();

dotenv.config({ path: (__dirname, "./config.env") });
app.use(express.json());

mongoose.connect(process.env.DATABASE, {}).then(() => {
  console.log("DB connection successful");
});

const projectRouter = require("./backend/routes/ProjectRoutes");
const userRouter = require("./backend/routes/UserRoutes");
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/users", userRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`app running on port ${port}`);
});
