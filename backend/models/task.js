const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
    },
    Date: {
      type: Date,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.post("save", async function () {
  await updateProjectTotalDuration(this.projectId);
});

taskSchema.post("remove", async function () {
  await updateProjectTotalDuration(this.projectId);
});

taskSchema.post("findOneAndUpdate", async function (doc) {
  await updateProjectTotalDuration(doc.projectId);
});

const updateProjectTotalDuration = async (projectId) => {
  const Task = mongoose.model("Task");
  const Project = mongoose.model("Project");

  const tasks = await Task.find({ projectId });
  const totalDuration = tasks.reduce((total, task) => total + task.duration, 0);

  await Project.findByIdAndUpdate(projectId, { totalDuration });
};

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
