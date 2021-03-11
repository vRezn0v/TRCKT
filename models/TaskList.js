const mongoose = require("mongoose");

const taskListSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
})

module.exports = mongoose.model("TaskList", taskListSchema)