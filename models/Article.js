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
          id: String
        }],
        counter: Number
      },
      like: {
        users: [{
          id: String
        }],
        counter: Number
      },
      dislike: {
        users: [{
          id: String
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
    views: { type: Number, default: 0 },
    slug:String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", ArticleSchema);
