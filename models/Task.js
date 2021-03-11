const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    listId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TaskList",
        required: true
    }
})

module.exports = mongoose.model("Task", taskSchema)