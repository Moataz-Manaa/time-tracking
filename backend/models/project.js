const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    projectName: {
      type: String,
      required: true,
    },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    totalDuration: {
      type: Number,
      default: 0,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    userDurations: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        duration: { type: Number, default: 0 },
      },
    ],
    /*
    joinTokens: [
      {
        token: { type: String, required: true },
        email: { type: String, required: true },
      },
    ],*/
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
