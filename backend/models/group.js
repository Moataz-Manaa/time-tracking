const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const teamSchema = new Schema({
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;
