"use strict";

var mongoose = require("mongoose");

var Schema = mongoose.Schema;
var adminSchema = new Schema({
  name: {
    type: String
  },
  mobile: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    "default": true
  }
}, {
  timestamps: true
});
module.exports = mongoose.model("Admin", adminSchema);