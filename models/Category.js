const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: { type: String },
    subCategory: [],
    location: String,
    active: Boolean
})

module.exports = mongoose.model('Category', categorySchema);
