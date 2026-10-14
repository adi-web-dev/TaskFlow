const Activity = require("../models/Activity");

const createActivity = async ({
    task,
    user,
    type,
    message,
    metadata = {},
}) => {
    try {
        await Activity.create({
            task,
            user,
            type,
            message,
            metadata,
        });
    } catch (error) {
        console.error("Create activity error:", error);
    }
};

module.exports = createActivity;