const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

const app = express();

dotenv.config({ path: (__dirname, "./config.env") });
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.DATABASE, {}).then(() => {
  console.log("DB connection successful");
});

const projectRouter = require("./backend/routes/ProjectRoutes");
app.use("/projects", projectRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`app running on port ${port}`);
});
