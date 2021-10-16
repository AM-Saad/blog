"use strict";

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var bookmarkSchema = new Schema({
  sessionId: String,
  items: [{
    id: {
      type: Schema.Types.ObjectId,
      ref: 'Article'
    },
    title: String,
    image: String,
    category: String,
    date: String,
    time: String
  }],
  total: Number
});
module.exports = mongoose.model('Bookmark', bookmarkSchema);