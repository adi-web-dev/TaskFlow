const Task = require("../models/Task");
const Project = require("../models/Project");
const Workspace = require("../models/Workspace");
const User = require("../models/User");
const createActivity = require("../utils/createActivity");

const isWorkspaceOwner = async (projectId, userId) => {
    const project = await Project.findById(projectId).select("workspace");

    if (!project) {
        return {
            allowed: false,
            status: 404,
            message: "Project not found",
        };
    }

    const workspace = await Workspace.findById(project.workspace).select("owner");

    if (!workspace) {
        return {
            allowed: false,
            status: 404,
            message: "Workspace not found",
        };
    }

    if (workspace.owner.toString() !== userId) {
        return {
            allowed: false,
            status: 403,
            message: "Only the workspace owner can manage tasks",
        };
    }

    return {
        allowed: true,
        workspace,
        project,
    };
};

const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            assignedTo,
            status,
            priority,
            dueDate,
        } = req.body;

        const { projectId } = req.params;

        // Check title
        if (!title) {
            return res.status(400).json({
                message: "Task title is required",
            });
        }

        // Find project
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const permission = await isWorkspaceOwner(
            projectId,
            req.user.userId
        );

        if (!permission.allowed) {
            return res.status(permission.status).json({
                message: permission.message,
            });
        }



        // Create task
        const task = await Task.create({
            title,
            description,
            project: projectId,
            workspace: project.workspace,
            createdBy: req.user.userId,
            assignedTo: assignedTo || null,
            status,
            priority,
            dueDate,
        });

        await createActivity({
            task: task._id,
            user: req.user.userId,
            type: "created",
            message: "Task was created",
        });

        res.status(201).json({
            message: "Task created successfully",
            task,
        });
    } catch (error) {
        console.error("Create task error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const getTasks = async (req, res) => {
    try {
        const { projectId } = req.params;

        let tasks = null;

        // Find project
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const workspaceId = project.workspace;


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

        if (isOwner) {
            // Owner can see all tasks in the workspace
            tasks = await Task.find({
                workspace: workspaceId,
            })
                .populate("createdBy", "name email")
                .populate("assignedTo", "name email")
                .sort({ createdAt: -1 });
        } else {
            // Regular member can only see their assigned tasks
            tasks = await Task.find({
                workspace: workspaceId,
                assignedTo: req.user.userId,
            })
                .populate("createdBy", "name email")
                .populate("assignedTo", "name email")
                .sort({ createdAt: -1 });
        }

        res.status(200).json({
            tasks,
        });
    } catch (error) {
        console.error("Get tasks error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const updateTask = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            dueDate,
        } = req.body;

        const { taskId } = req.params;

        // Find task
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        // Find project
        const project = await Project.findById(
            task.project
        );

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        // Check workspace access
        const permission = await isWorkspaceOwner(
            task.project,
            req.user.userId
        );

        if (!permission.allowed) {
            return res.status(permission.status).json({
                message: permission.message,
            });
        }

        // Update fields
        if (title !== undefined) {
            task.title = title;
        }

        if (description !== undefined) {
            task.description = description;
        }

        if (priority !== undefined) {
            task.priority = priority;
        }

        if (dueDate !== undefined) {
            task.dueDate = dueDate;
        }

        const oldTitle = task.title;
        const oldDescription = task.description || "";
        const oldPriority = task.priority;
        const oldDueDate = task.dueDate
            ? new Date(task.dueDate).toISOString()
            : null;

        await task.save();

        if (
            priority !== undefined &&
            oldPriority !== task.priority
        ) {
            await createActivity({
                task: task._id,
                user: req.user.userId,
                type: "priority_changed",
                message: `Priority changed from ${oldPriority} to ${task.priority}`,
                metadata: {
                    oldPriority,
                    newPriority: task.priority,
                },
            });
        }

        const newDueDate = task.dueDate
            ? new Date(task.dueDate).toISOString()
            : null;

        if (oldDueDate !== newDueDate) {
            await createActivity({
                task: task._id,
                user: req.user.userId,
                type: "due_date_changed",
                message: "Due date was changed",
                metadata: {
                    oldDueDate,
                    newDueDate,
                },
            });
        }

        const changes = {};

        if (title !== undefined && oldTitle !== task.title) {
            changes.title = {
                old: oldTitle,
                new: task.title,
            };
        }

        if (
            description !== undefined &&
            oldDescription !== task.description
        ) {
            changes.description = {
                old: oldDescription,
                new: task.description,
            };
        }

        if (Object.keys(changes).length > 0) {
            await createActivity({
                task: task._id,
                user: req.user.userId,
                type: "updated",
                message: "Task details were updated",
                metadata: changes,
            });
        }

        res.status(200).json({
            message: "Task updated successfully",
            task,
        });
    } catch (error) {
        console.error("Update task error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const assignTask = async (req, res) => {
    try {
        const { userId } = req.body;
        const { taskId } = req.params;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required",
            });
        }

        // Find task
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        // Find project
        const project = await Project.findById(
            task.project
        );

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        // Find workspace
        const workspace = await Workspace.findById(
            project.workspace
        );

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        // Only owner can assign tasks
        if (
            workspace.owner.toString() !==
            req.user.userId
        ) {
            return res.status(403).json({
                message:
                    "Only workspace owner can assign tasks",
            });
        }

        // Check user exists
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Check user belongs to workspace
        const isMember = workspace.members.some(
            (member) =>
                member.user.toString() === userId
        );

        const isOwner =
            workspace.owner.toString() === userId;


        if (!isMember && !isOwner) {
            return res.status(400).json({
                message:
                    "User does not belong to this workspace",
            });
        }


        const oldAssignedTo = task.assignedTo
            ? task.assignedTo.toString()
            : null;

        // Assign task
        task.assignedTo = userId;

        await task.save();

        const newAssignedTo = task.assignedTo
            ? task.assignedTo.toString()
            : null;

        if (oldAssignedTo !== newAssignedTo) {
            await createActivity({
                task: task._id,
                user: req.user.userId,
                type: "assigned",
                message: newAssignedTo
                    ? "Task assignment was changed"
                    : "Task was unassigned",
                metadata: {
                    oldAssignedTo,
                    newAssignedTo,
                },
            });
        }

        const updatedTask = await Task.findById(taskId)
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email");

        res.status(200).json({
            message: "Task assigned successfully",
            task: updatedTask,
        });
    } catch (error) {
        console.error("Assign task error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        // Find task
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        // Find project
        const project = await Project.findById(
            task.project
        );

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        // Find workspace
        const workspace = await Workspace.findById(
            project.workspace
        );

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        // Only owner can delete task
        if (
            workspace.owner.toString() !==
            req.user.userId
        ) {
            return res.status(403).json({
                message:
                    "Only workspace owner can delete tasks",
            });
        }

        await Task.findByIdAndDelete(taskId);

        res.status(200).json({
            message: "Task deleted successfully",
        });
    } catch (error) {
        console.error("Delete task error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const getMyTasks = async (req, res) => {
    try {
        const { workspaceId } = req.params;

        let tasks = null;

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

        if (isOwner) {
            // Owner can see all tasks in the workspace
            tasks = await Task.find({
                workspace: workspaceId,
            })
                .populate("project", "name")
                .populate("createdBy", "name email")
                .sort({ createdAt: -1 });
        } else {
            // Regular member can only see their assigned tasks
            tasks = await Task.find({
                workspace: workspaceId,
                assignedTo: req.user.userId,
            })
                .populate("project", "name")
                .populate("createdBy", "name email")
                .sort({ createdAt: -1 });
        }

        res.status(200).json({
            message: "this is under getmytasks",
            tasks,
        });
    } catch (error) {
        console.error("Get my tasks error:", error);

        res.status(500).json({
            message: "Server error",
            error: error
        });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = ["todo", "in-progress", "done"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid task status",
            });
        }

        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        /*
          Owner can change any task status.
          Assigned member can change only their own task status.
        */

        const project = await Project.findById(task.project).select(
            "workspace"
        );

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const workspace = await Workspace.findById(project.workspace).select(
            "owner"
        );

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        const userId = req.user.userId;

        const isOwner =
            workspace.owner.toString() === userId;

        const isAssignedMember =
            task.assignedTo &&
            task.assignedTo.toString() === userId;

        if (!isOwner && !isAssignedMember) {
            return res.status(403).json({
                message:
                    "You can only change the status of tasks assigned to you",
            });
        }

        const oldStatus = task.status;

        if (status === "done" && oldStatus !== "done") {
            task.completedAt = new Date();
        }

        if (status !== "done" && oldStatus === "done") {
            task.completedAt = null;
        }

        task.status = status;

        await task.save();

        await createActivity({
            task: task._id,
            user: req.user.userId,
            type: "status_changed",
            message: `Status changed from ${oldStatus} to ${status}`,
            metadata: {
                oldStatus,
                newStatus: status,
            },
        });

        const updatedTask = await Task.findById(task._id)
            .populate("project", "name")
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email");

        res.status(200).json({
            message: "Task status updated successfully",
            task: updatedTask,
        });
    } catch (error) {
        console.error("Update task status error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const taskDetails = async (req, res) => {
    try {
        const { taskId } = req.params;

        console.log("----------inside deatils---------------", taskId)

        const task = await Task.findById(taskId)
            .populate("project", "name")
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email");

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        console.log(task)
        if (task.createdBy._id.toString() === req.user.userId || task.assignedTo._id.toString() === req.user.userId) {
            // return res.status(403).json({
            //     message: "You are not a member of this workspace",
            // });
            return res.status(200).json({
                task,
            });
        }


    } catch (error) {
        console.error("Get task details error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

module.exports = {
    createTask,
    getTasks,
    updateTask,
    assignTask,
    deleteTask,
    getMyTasks,
    updateTaskStatus,
    taskDetails,
};