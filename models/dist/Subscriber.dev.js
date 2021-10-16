"use strict";

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var subscriberSchema = new Schema({
  mobile: {
    type: String
  },
  email: {
    type: String
  },
  name: {
    type: String,
    required: true
  },
  message: {
    type: String
  }
});
module.exports = mongoose.model('Subscriber', subscriberSchema);