const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    Required: true
  },
  email: {
    type: String,
    Required: true
  },
  password: {
    type: String,
    Required: true
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    Default: Date.now
  }
});

module.exports = User = mongoose.model("users", UserSchema);
