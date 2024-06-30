const mongoose = require("mongoose");
const Task = require("./task");

const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    projectName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
