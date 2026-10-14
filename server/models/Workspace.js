const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        inviteCode: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        members: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },

                role: {
                    type: String,
                    enum: ["admin", "member"],
                    default: "member",
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Workspace", workspaceSchema);