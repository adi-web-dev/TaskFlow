const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
    {
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        type: {
            type: String,
            enum: [
                "created",
                "assigned",
                "status_changed",
                "priority_changed",
                "due_date_changed",
                "updated",
                "comment_added",
            ],
            required: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },

        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Activity", activitySchema);