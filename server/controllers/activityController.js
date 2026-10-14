const Activity = require("../models/Activity");
const Task = require("../models/Task");
const Project = require("../models/Project");
const Workspace = require("../models/Workspace");

const getTaskActivities = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const project = await Project.findById(task.project).select(
            "workspace"
        );

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const workspace = await Workspace.findById(
            project.workspace
        ).select("owner members");

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        const userId = req.user.userId;

        const isOwner =
            workspace.owner.toString() === userId;

        const isMember = workspace.members.some(
            (member) =>
                member.user.toString() === userId
        );

        const isAssigned =
            task.assignedTo &&
            task.assignedTo.toString() === userId;

        if (!isOwner && !isMember && !isAssigned) {
            return res.status(403).json({
                message: "You are not allowed to view task activity",
            });
        }

        const activities = await Activity.find({
            task: taskId,
        })
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            activities,
        });
    } catch (error) {
        console.error("Get task activities error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

module.exports = {
    getTaskActivities,
};