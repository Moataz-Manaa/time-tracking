const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const app = express();

dotenv.config({ path: (__dirname, "./config.env") });
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.DATABASE, {}).then(() => {
  console.log("DB connection successful");
});

const projectRouter = require("./backend/routes/ProjectRoutes");
const userRouter = require("./backend/routes/UserRoutes");
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/users", userRouter);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`app running on port ${port}`);
});
