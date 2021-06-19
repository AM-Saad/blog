const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ArticleSchema = new Schema(
  {
    site_description: String,
    location: String,
    title: String,
    content: String,
    image: String,
    active: Boolean,
    reactions: {
      highfive: {
        users: [{
          id: { type: Schema.Types.ObjectId, ref: 'User' }
        }],
        counter: Number
      },
      like: {
        users: [{
          id: { type: Schema.Types.ObjectId, ref: 'User' }
        }],
        counter: Number
      },
      dislike: {
        users: [{
          id: { type: Schema.Types.ObjectId, ref: 'User' }
        }],
        counter: Number
      },
    },
    shares: [],
    tags: [],
    category: { name: String, sub: String },

    discussion: [{
      name: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'subscriber'
      },
      comment: String,
      replies: [
        {
          name: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'subscriber'
          },
          comment: String,
        }
      ],
    }],
    date: String,
    time: String,
    delta: {},
    lang: String,
    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", ArticleSchema);
