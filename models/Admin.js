const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = new Schema(
    {
        name: {
            type: String,
        },
        mobile: {
            type: String,
        },
        email: {
            type: String,
        },
        password: {
            type: String,
            required: true
        },

        isAdmin: { type: Boolean, default: true },

    },
    { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
