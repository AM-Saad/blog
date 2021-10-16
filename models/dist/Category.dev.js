"use strict";

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var categorySchema = new Schema({
  name: {
    type: String
  },
  subCategory: [],
  location: String,
  active: Boolean
});
module.exports = mongoose.model('Category', categorySchema);