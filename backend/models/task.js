const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    totalDuration: {
      type: Number,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.pre("save", function (next) {
  if (this.startTime && this.endTime) {
    const duration = (new Date(this.endTime) - new Date(this.startTime)) / 1000; // duration in seconds
    this.totalDuration = duration / 3600; // convert seconds to hours
  } else {
    this.totalDuration = 0;
  }
  next();
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
