const Workspace = require("../models/Workspace");
const User = require("../models/User");
const Task = require("../models/Task");
const Activity = require("../models/Activity");
const generateInviteCode = require("../utils/generateInviteCode");

const createWorkspace = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Check workspace name
        if (!name) {
            return res.status(400).json({
                message: "Workspace name is required",
            });
        }

        // Create workspace
        const workspace = await Workspace.create({
            name,
            description,
            owner: req.user.userId,
            inviteCode: generateInviteCode(),
        });

        res.status(201).json({
            message: "Workspace created successfully",
            workspace,
        });
    } catch (error) {
        console.error("Create workspace error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const joinWorkspace = async (req, res) => {
    try {
        const { inviteCode } = req.body;

        if (!inviteCode?.trim()) {
            return res.status(400).json({
                message: "Invite code is required",
            });
        }

        const workspace = await Workspace.findOne({
            inviteCode: inviteCode.trim().toUpperCase(),
        });

        if (!workspace) {
            return res.status(404).json({
                message: "Invalid workspace invite code",
            });
        }

        const userId = req.user.userId;

        // Owner is already part of the workspace
        if (workspace.owner.toString() === userId) {
            return res.status(400).json({
                message: "You are already the owner of this workspace",
            });
        }

        // Check existing member
        const alreadyMember = workspace.members.some(
            (member) =>
                member.user.toString() === userId
        );

        if (alreadyMember) {
            return res.status(400).json({
                message: "You are already a member of this workspace",
            });
        }

        workspace.members.push({
            user: userId,
            role: "member",
        });

        await workspace.save();

        const updatedWorkspace = await Workspace.findById(
            workspace._id
        )
            .populate("owner", "name email")
            .populate("members.user", "name email");

        res.status(200).json({
            message: "Successfully joined workspace",
            workspace: updatedWorkspace,
        });
    } catch (error) {
        console.error("Join workspace error:", error);

        res.status(500).json({
            message: "Failed to join workspace",
        });
    }
};

const getMyWorkspaces = async (req, res) => {
    try {
        const workspaces = await Workspace.find({
            $or: [
                { owner: req.user.userId },
                { "members.user": req.user.userId },
            ],
        })
            .populate("owner", "name email")
            .populate("members.user", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            workspaces,
        });
    } catch (error) {
        console.error("Get workspaces error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const updateWorkspace = async (req, res) => {
    try {
        const { name, description } = req.body;

        const workspace = await Workspace.findById(req.params.id);

        // Check workspace exists
        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        // Check ownership
        if (workspace.owner.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You are not allowed to update this workspace",
            });
        }

        // Update fields
        if (name !== undefined) {
            workspace.name = name;
        }

        if (description !== undefined) {
            workspace.description = description;
        }

        await workspace.save();

        res.status(200).json({
            message: "Workspace updated successfully",
            workspace,
        });
    } catch (error) {
        console.error("Update workspace error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const deleteWorkspace = async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.params.id);

        // Check workspace exists
        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        // Check ownership
        if (workspace.owner.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You are not allowed to delete this workspace",
            });
        }

        await Workspace.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Workspace deleted successfully",
        });
    } catch (error) {
        console.error("Delete workspace error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const addMember = async (req, res) => {
    try {
        const { userId } = req.body;

        // Check user ID
        if (!userId) {
            return res.status(400).json({
                message: "User ID is required",
            });
        }

        // Find workspace
        const workspace = await Workspace.findById(req.params.id);

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        // Only owner can add members
        if (workspace.owner.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "Only workspace owner can add members",
            });
        }

        // Check if user exists
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Check if user is already a member
        const alreadyMember = workspace.members.some(
            (member) => member.user.toString() === userId
        );

        if (alreadyMember) {
            return res.status(400).json({
                message: "User is already a member",
            });
        }

        // Check if user is the owner
        if (workspace.owner.toString() === userId) {
            return res.status(400).json({
                message: "Owner is already part of the workspace",
            });
        }

        // Add member
        workspace.members.push({
            user: userId,
            role: "member",
        });

        await workspace.save();

        res.status(200).json({
            message: "Member added successfully",
            workspace,
        });
    } catch (error) {
        console.error("Add member error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const getMembers = async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.params.id)
            .populate("owner", "name email")
            .populate("members.user", "name email");

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }
        // Check if current user is the owner
        // if (workspace.owner._id.toString() !== req.user.userId) {
        //     return res.status(403).json({
        //         message: "You are not allowed to view these members",
        //     });
        // }

        res.status(200).json({
            owner: workspace.owner,
            members: workspace.members,
        });
    } catch (error) {
        console.error("Get members error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const getTeamWorkload = async (req, res) => {
    try {
        const { id: workspaceId } = req.params;

        // Find workspace
        const workspace = await Workspace.findById(workspaceId)
            .populate("owner", "name email")
            .populate("members.user", "name email");

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        // Only workspace owner can view team workload
        if (workspace.owner._id.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "Only workspace owner can view team workload",
            });
        }

        // Get all tasks belonging to this workspace
        const tasks = await Task.find({
            workspace: workspaceId,
        }).select(
            "assignedTo status priority dueDate title"
        );

        // Owner + workspace members
        const teamMembers = [
            {
                user: workspace.owner,
                role: "owner",
            },
            ...workspace.members.map((member) => ({
                user: member.user,
                role: member.role,
            })),
        ];

        const now = new Date();

        const workload = teamMembers.map((member) => {
            const memberTasks = tasks.filter(
                (task) =>
                    task.assignedTo &&
                    task.assignedTo.toString() ===
                    member.user._id.toString()
            );

            const todo = memberTasks.filter(
                (task) => task.status === "todo"
            ).length;

            const inProgress = memberTasks.filter(
                (task) => task.status === "in-progress"
            ).length;

            const done = memberTasks.filter(
                (task) => task.status === "done"
            ).length;

            const overdue = memberTasks.filter((task) => {
                if (!task.dueDate || task.status === "done") {
                    return false;
                }

                return new Date(task.dueDate) < now;
            }).length;

            const highPriority = memberTasks.filter(
                (task) => task.priority === "high"
            ).length;

            return {
                user: member.user,
                role: member.role,
                total: memberTasks.length,
                todo,
                inProgress,
                done,
                overdue,
                highPriority,
            };
        });

        res.status(200).json({
            workload,
        });
    } catch (error) {
        console.error("Get team workload error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const getMemberDetails = async (req, res) => {
    try {
        const { id: workspaceId, userId } = req.params;

        // Get workspace
        const workspace = await Workspace.findById(workspaceId)
            .populate("owner", "name email")
            .populate("members.user", "name email");

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        // Only workspace owner can view member details
        if (workspace.owner._id.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "Only workspace owner can view member details",
            });
        }

        // Check whether requested user belongs to workspace
        const isOwner = workspace.owner._id.toString() === userId;

        const member = workspace.members.find(
            (member) => member.user._id.toString() === userId
        );

        if (!isOwner && !member) {
            return res.status(404).json({
                message: "User is not a member of this workspace",
            });
        }

        const user = isOwner ? workspace.owner : member.user;

        // Get all tasks assigned to this user in this workspace
        const tasks = await Task.find({
            workspace: workspaceId,
            assignedTo: userId,
        })
            .populate("project", "name")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        const now = new Date();

        const taskSummary = {
            total: tasks.length,

            todo: tasks.filter(
                (task) => task.status === "todo"
            ).length,

            inProgress: tasks.filter(
                (task) => task.status === "in-progress"
            ).length,

            done: tasks.filter(
                (task) => task.status === "done"
            ).length,

            overdue: tasks.filter((task) => {
                if (!task.dueDate || task.status === "done") {
                    return false;
                }

                return new Date(task.dueDate) < now;
            }).length,

            highPriority: tasks.filter(
                (task) => task.priority === "high"
            ).length,
        };

        res.status(200).json({
            user,
            role: isOwner ? "owner" : member.role,
            summary: taskSummary,
            tasks,
        });
    } catch (error) {
        console.error("Get member details error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const removeMember = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find workspace
        const workspace = await Workspace.findById(req.params.id);

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        // Only owner can remove members
        if (workspace.owner.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "Only workspace owner can remove members",
            });
        }

        // Owner cannot remove themselves
        if (workspace.owner.toString() === userId) {
            return res.status(400).json({
                message: "Workspace owner cannot be removed",
            });
        }

        // Check if member exists
        const memberExists = workspace.members.some(
            (member) => member.user.toString() === userId
        );

        if (!memberExists) {
            return res.status(404).json({
                message: "Member not found in this workspace",
            });
        }

        // Remove member
        workspace.members = workspace.members.filter(
            (member) => member.user.toString() !== userId
        );

        await workspace.save();

        res.status(200).json({
            message: "Member removed successfully",
            workspace,
        });
    } catch (error) {
        console.error("Remove member error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const getTeamTasks = async (req, res) => {
    try {
        const { id: workspaceId } = req.params;

        // Get workspace
        const workspace = await Workspace.findById(workspaceId)
            .populate("owner", "name email");

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        // Only workspace owner can view all team tasks
        if (workspace.owner._id.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "Only workspace owner can view team tasks",
            });
        }

        // Get all tasks belonging to this workspace
        const tasks = await Task.find({
            workspace: workspaceId,
        })
            .populate("assignedTo", "name email")
            .populate("project", "name")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            tasks,
        });
    } catch (error) {
        console.error("Get team tasks error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const getMemberPerformance = async (req, res) => {
    try {
        const { workspaceId, userId } = req.params;

        // --------------------------------
        // Check workspace
        // --------------------------------

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        // --------------------------------
        // Only workspace owner can access
        // --------------------------------

        if (workspace.owner.toString() !== req.user.userId) {
            return res.status(403).json({
                message:
                    "Only the workspace owner can view employee performance",
            });
        }

        // --------------------------------
        // Check employee belongs to workspace
        // --------------------------------

        const isMember = workspace.members.some(
            (member) => member.toString() === userId
        );

        const isOwner =
            workspace.owner.toString() === userId;

        if (!isMember && !isOwner) {
            return res.status(404).json({
                message:
                    "Employee does not belong to this workspace",
            });
        }

        // --------------------------------
        // Get employee
        // --------------------------------

        const employee = await User.findById(userId).select(
            "name email"
        );

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found",
            });
        }

        // --------------------------------
        // Get employee tasks
        // --------------------------------

        const tasks = await Task.find({
            workspace: workspaceId,
            assignedTo: userId,
        })
            .select(
                "title status priority dueDate createdAt updatedAt completedAt"
            )
            .populate("project", "name")
            .sort({ createdAt: -1 });


        const activities = await Activity.find({
            user: userId,
            task: {
                $in: tasks.map((task) => task._id),
            },
        }).select("task type createdAt");

        // --------------------------------
        // Basic metrics
        // --------------------------------

        const totalAssigned = tasks.length;

        const completed = tasks.filter(
            (task) => task.status === "done"
        ).length;

        const inProgress = tasks.filter(
            (task) => task.status === "in-progress"
        ).length;

        const todo = tasks.filter(
            (task) => task.status === "todo"
        ).length;



        const activityMetrics = {
            totalActivities: activities.length,

            statusChanges: activities.filter(
                (activity) =>
                    activity.type === "status_changed"
            ).length,

            commentsAdded: activities.filter(
                (activity) =>
                    activity.type === "comment_added"
            ).length,

            taskUpdates: activities.filter(
                (activity) =>
                    activity.type === "updated"
            ).length,

            priorityChanges: activities.filter(
                (activity) =>
                    activity.type === "priority_changed"
            ).length,

            dueDateChanges: activities.filter(
                (activity) =>
                    activity.type === "due_date_changed"
            ).length,

            assignments: activities.filter(
                (activity) =>
                    activity.type === "assigned"
            ).length,
        };

        // --------------------------------
        // Overdue tasks
        // --------------------------------

        const now = new Date();

        const overdue = tasks.filter(
            (task) =>
                task.dueDate &&
                new Date(task.dueDate) < now &&
                task.status !== "done"
        ).length;

        // --------------------------------
        // High priority
        // --------------------------------

        const highPriorityCompleted = tasks.filter(
            (task) =>
                task.priority === "high" &&
                task.status === "done"
        ).length;

        const highPriorityIncomplete = tasks.filter(
            (task) =>
                task.priority === "high" &&
                task.status !== "done"
        ).length;

        // --------------------------------
        // Completion rate
        // --------------------------------

        const completionRate =
            totalAssigned > 0
                ? Math.round(
                    (completed / totalAssigned) * 100
                )
                : 0;

        // --------------------------------
        // Overdue rate
        // --------------------------------

        const overdueRate =
            totalAssigned > 0
                ? Math.round(
                    (overdue / totalAssigned) * 100
                )
                : 0;


        const completedOnTime = tasks.filter(
            (task) =>
                task.status === "done" &&
                task.dueDate &&
                task.completedAt &&
                new Date(task.completedAt) <=
                new Date(task.dueDate)
        ).length;

        const completedLate = tasks.filter(
            (task) =>
                task.status === "done" &&
                task.dueDate &&
                task.completedAt &&
                new Date(task.completedAt) >
                new Date(task.dueDate)
        ).length;

        const onTimeCompletionRate =
            completed > 0
                ? Math.round(
                    (completedOnTime / completed) * 100
                )
                : 0;

        // --------------------------------
        // Average completion time
        // --------------------------------

        const completedTasks = tasks.filter(
            (task) =>
                task.status === "done" &&
                task.completedAt
        );

        let averageCompletionTime = 0;

        if (completedTasks.length > 0) {
            const totalCompletionTime =
                completedTasks.reduce(
                    (total, task) => {
                        const created =
                            new Date(task.createdAt);

                        const completedAt =
                            new Date(task.completedAt);

                        const difference =
                            completedAt.getTime() -
                            created.getTime();

                        return total + difference;
                    },
                    0
                );

            averageCompletionTime = Math.round(
                totalCompletionTime /
                completedTasks.length /
                (1000 * 60 * 60 * 24)
            );
        }

        // --------------------------------
        // Return performance data
        // --------------------------------

        res.status(200).json({
            employee: {
                _id: employee._id,
                name: employee.name,
                email: employee.email,
            },

            metrics: {
                totalAssigned,
                completed,
                inProgress,
                todo,
                overdue,
                highPriorityCompleted,
                highPriorityIncomplete,
                completionRate,
                overdueRate,
                averageCompletionTime,
                completedOnTime,
                completedLate,
                onTimeCompletionRate,
            },

            activityMetrics,


            tasks,
        });
    } catch (error) {
        console.error(
            "Get member performance error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch member performance",
        });
    }
};

module.exports = {
    createWorkspace,
    joinWorkspace,
    getMyWorkspaces,
    updateWorkspace,
    deleteWorkspace,
    addMember,
    getMembers,
    removeMember,
    getTeamWorkload,
    getMemberDetails,
    getTeamTasks,
    getMemberPerformance,
};