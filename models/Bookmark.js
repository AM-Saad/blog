const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookmarkSchema = new Schema({
    sessionId: String,
    items: [
        {
            id: {
                type: Schema.Types.ObjectId,
                ref: 'Article',
            },
            name: String,
            image: String,
            category: String,
        }
    ],
    total: Number,

});


module.exports = mongoose.model('Bookmark', bookmarkSchema);
