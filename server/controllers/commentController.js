const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Project = require("../models/Project");
const Workspace = require("../models/Workspace");
const createActivity = require("../utils/createActivity");

const getTaskAccess = async (taskId, userId) => {
    const task = await Task.findById(taskId).select(
        "project assignedTo"
    );

    if (!task) {
        return {
            allowed: false,
            status: 404,
            message: "Task not found",
        };
    }

    const project = await Project.findById(task.project).select(
        "workspace"
    );

    if (!project) {
        return {
            allowed: false,
            status: 404,
            message: "Project not found",
        };
    }

    const workspace = await Workspace.findById(project.workspace).select(
        "owner members"
    );

    if (!workspace) {
        return {
            allowed: false,
            status: 404,
            message: "Workspace not found",
        };
    }

    const isOwner =
        workspace.owner.toString() === userId;

    const isAssignedMember =
        task.assignedTo &&
        task.assignedTo.toString() === userId;

    const isMember = workspace.members.some(
        (member) => member.user.toString() === userId
    );

    return {
        allowed: isOwner || isAssignedMember || isMember,
        status: 200,
        task,
        workspace,
        isOwner,
        isAssignedMember,
        isMember,
    };
};

const getTaskComments = async (req, res) => {
    try {
        const access = await getTaskAccess(
            req.params.taskId,
            req.user.userId
        );

        if (!access.allowed) {
            return res.status(403).json({
                message: "You are not allowed to view these comments",
            });
        }

        const comments = await Comment.find({
            task: req.params.taskId,
        })
            .populate("user", "name email")
            .sort({ createdAt: 1 });

        res.status(200).json({
            comments,
        });
    } catch (error) {
        console.error("Get task comments error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const createComment = async (req, res) => {
    try {
        const { text } = req.body;
        console.log("Received comment text:", text);

        if (!text || !text.trim()) {
            return res.status(400).json({
                message: "Comment cannot be empty",
            });
        }

        const access = await getTaskAccess(
            req.params.taskId,
            req.user.userId
        );

        if (!access.allowed) {
            return res.status(403).json({
                message: "You are not allowed to comment on this task",
            });
        }

        const comment = await Comment.create({
            task: req.params.taskId,
            user: req.user.userId,
            text: text.trim(),
        });

        await createActivity({
            task: req.params.taskId,
            user: req.user.userId,
            type: "comment_added",
            message: "Added a comment",
        });

        const populatedComment = await Comment.findById(
            comment._id
        ).populate("user", "name email");



        res.status(201).json({
            message: "Comment added successfully",
            comment: populatedComment,
        });
    } catch (error) {
        console.error("Create comment error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(
            req.params.commentId
        );

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found",
            });
        }

        if (comment.user.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You can only delete your own comments",
            });
        }

        await Comment.findByIdAndDelete(
            req.params.commentId
        );

        res.status(200).json({
            message: "Comment deleted successfully",
        });
    } catch (error) {
        console.error("Delete comment error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

module.exports = {
    getTaskComments,
    createComment,
    deleteComment,
};