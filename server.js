const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

const app = express();

process.on("uncaughtException", (err) => {
  console.log("uncaught Exception! shutting down");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: (__dirname, "./config.env") });
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("DB connection successful");
  });

const projectRouter = require("./backend/routes/ProjectRoutes");
app.use("/projects", projectRouter);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`app running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("unhandle rejection! shutting down");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
