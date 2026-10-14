const Project = require("../models/Project");
const Workspace = require("../models/Workspace");

const createProject = async (req, res) => {
    try {
        const { name, description, status, dueDate } = req.body;
        const { workspaceId } = req.params;

        // Check project name
        if (!name) {
            return res.status(400).json({
                message: "Project name is required",
            });
        }

        // Find workspace
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        // Check if user is owner
        const isOwner =
            workspace.owner.toString() === req.user.userId;

        // Check if user is a member
        const isMember = workspace.members.some(
            (member) =>
                member.user.toString() === req.user.userId
        );

        // User must belong to workspace
        if (!isOwner && !isMember) {
            return res.status(403).json({
                message: "You are not a member of this workspace",
            });
        }

        // Create project
        const project = await Project.create({
            name,
            description,
            workspace: workspaceId,
            createdBy: req.user.userId,
            status,
            dueDate,
        });

        res.status(201).json({
            message: "Project created successfully",
            project,
        });
    } catch (error) {
        console.error("Create project error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const getProjects = async (req, res) => {
    try {
        const { workspaceId } = req.params;

        // Find workspace
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        // Check if user is owner
        const isOwner =
            workspace.owner.toString() === req.user.userId;

        // Check if user is a member
        const isMember = workspace.members.some(
            (member) =>
                member.user.toString() === req.user.userId
        );

        // User must belong to workspace
        if (!isOwner && !isMember) {
            return res.status(403).json({
                message: "You are not a member of this workspace",
            });
        }

        // Get projects
        const projects = await Project.find({
            workspace: workspaceId,
        })
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            projects,
        });
    } catch (error) {
        console.error("Get projects error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const updateProject = async (req, res) => {
    try {
        const { name, description, dueDate } = req.body;

        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        // Find workspace
        const workspace = await Workspace.findById(project.workspace);

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        // Check owner
        const isOwner =
            workspace.owner.toString() === req.user.userId;

        // Check member
        const isMember = workspace.members.some(
            (member) =>
                member.user.toString() === req.user.userId
        );

        if (!isOwner && !isMember) {
            return res.status(403).json({
                message: "You are not a member of this workspace",
            });
        }

        // Update only provided fields
        if (name !== undefined) {
            project.name = name;
        }

        if (description !== undefined) {
            project.description = description;
        }

        if (dueDate !== undefined) {
            project.dueDate = dueDate;
        }

        await project.save();

        res.status(200).json({
            message: "Project updated successfully",
            project,
        });
    } catch (error) {
        console.error("Update project error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const workspace = await Workspace.findById(project.workspace);

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        // Only workspace owner can delete project
        if (workspace.owner.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "Only workspace owner can delete projects",
            });
        }

        await Project.findByIdAndDelete(req.params.projectId);

        res.status(200).json({
            message: "Project deleted successfully",
        });
    } catch (error) {
        console.error("Delete project error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};
module.exports = {
    createProject,
    getProjects,
    updateProject,
    deleteProject,
};