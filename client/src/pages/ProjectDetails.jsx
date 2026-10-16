import { useEffect, useState } from "react";
import { ArrowLeft, Plus, CheckCircle2, Clock3, MoreHorizontal } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspace } from "../context/WorkspaceContext";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";

const ProjectDetails = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const { user } = useAuth();

    const { activeWorkspace, loading: workspaceLoading } = useWorkspace();
    const { isOwner } = useWorkspace();

    const [workspaceMembers, setWorkspaceMembers] = useState([]);

    const [showTaskDetails, setShowTaskDetails] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creatingTask, setCreatingTask] = useState(false);
    const [createError, setCreateError] = useState("");

    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        assignedTo: "",
        priority: "medium",
        dueDate: "",
    });

    const [openMenu, setOpenMenu] = useState(null);

    // Edit Task
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [editTask, setEditTask] = useState({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
    });
    const [updatingTask, setUpdatingTask] = useState(false);
    const [editError, setEditError] = useState("");

    // Assign Task
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assigningTask, setAssigningTask] = useState(null);
    const [assigneeId, setAssigneeId] = useState("");
    const [assigning, setAssigning] = useState(false);
    const [assignError, setAssignError] = useState("");

    // Delete Task
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingTask, setDeletingTask] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");


    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);
    const [addingComment, setAddingComment] = useState(false);
    const [commentError, setCommentError] = useState("");


    useEffect(() => {
        if (activeWorkspace) {
            fetchMembers();
        }
    }, [activeWorkspace]);

    const fetchProjectTasks = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/projects/${projectId}/tasks`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch project tasks"
                );
            }

            console.log(data)
            console.log(data.tasks)

            setTasks(data.tasks || []);
        } catch (error) {
            console.error("Fetch project tasks error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectTasks();

        const handleClickOutside = () => {
            setOpenMenu(null);
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener(
                "click",
                handleClickOutside
            );
        };

    }, [projectId]);

    const fetchComments = async (taskId) => {
        try {
            setLoadingComments(true);
            setCommentError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/tasks/${taskId}/comments`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch comments"
                );
            }

            setComments(data.comments || []);
        } catch (error) {
            console.error("Fetch comments error:", error);
            setCommentError(error.message);
        } finally {
            setLoadingComments(false);
        }
    };

    const openTaskDetails = (task) => {
        setSelectedTask(task);
        setCommentText("");
        setCommentError("");
        setShowTaskDetails(true);
        fetchComments(task._id);
    };

    const handleAddComment = async (taskId) => {
        if (!commentText.trim()) return;

        try {
            setAddingComment(true);
            setCommentError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/tasks/${taskId}/comments`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        text: commentText.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to add comment"
                );
            }

            setComments((prevComments) => [
                ...prevComments,
                data.comment,
            ]);

            setCommentText("");
        } catch (error) {
            console.error("Add comment error:", error);
            setCommentError(error.message);
        } finally {
            setAddingComment(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/comments/${commentId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete comment"
                );
            }

            setComments((prevComments) =>
                prevComments.filter(
                    (comment) => comment._id !== commentId
                )
            );
        } catch (error) {
            console.error("Delete comment error:", error);
            setCommentError(error.message);
        }
    };

    const todoTasks = tasks.filter(
        (task) => task.status === "todo"
    );

    const inProgressTasks = tasks.filter(
        (task) => task.status === "in-progress"
    );

    const completedTasks = tasks.filter(
        (task) => task.status === "done"
    );

    const fetchMembers = async () => {
        try {
            const token = localStorage.getItem("token");

            const workspaceId = activeWorkspace?._id;

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/workspaces/${workspaceId}/members`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch members");
            }

            setWorkspaceMembers([
                data.owner,
                ...data.members.map((member) => member.user),
            ]);

            console.log("Workspace members:", [
                workspaceMembers
            ]);
        } catch (error) {
            console.error("Get members error:", error);
        }
    };

    const handleCreateTask = async () => {
        try {
            setCreateError("");

            if (!newTask.title.trim()) {
                setCreateError("Task title is required");
                return;
            }

            setCreatingTask(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/projects/${projectId}/tasks`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: newTask.title,
                        description: newTask.description,
                        assignedTo: newTask.assignedTo || null,
                        priority: newTask.priority,
                        dueDate: newTask.dueDate || null,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to create task"
                );
            }

            setShowCreateModal(false);

            setNewTask({
                title: "",
                description: "",
                assignedTo: "",
                priority: "medium",
                dueDate: "",
            });

            await fetchProjectTasks();
        } catch (error) {
            console.error("Create task error:", error);
            setCreateError(error.message);
        } finally {
            setCreatingTask(false);
        }
    };


    const openEditModal = (task) => {
        setEditingTask(task);

        setEditTask({
            title: task.title || "",
            description: task.description || "",
            priority: task.priority || "medium",
            dueDate: task.dueDate
                ? task.dueDate.slice(0, 10)
                : "",
        });

        setEditError("");
        setShowEditModal(true);
    };

    const openAssignModal = (task) => {
        setAssigningTask(task);
        setAssigneeId(task.assignedTo?._id || task.assignedTo || "");

        setAssignError("");
        setShowAssignModal(true);
    };

    const openDeleteModal = (task) => {
        setDeletingTask(task);
        setDeleteError("");
        setShowDeleteModal(true);
    };

    const handleUpdateTask = async () => {
        try {
            setEditError("");

            if (!editTask.title.trim()) {
                setEditError("Task title is required");
                return;
            }

            setUpdatingTask(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/tasks/${editingTask._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: editTask.title,
                        description: editTask.description,
                        priority: editTask.priority,
                        dueDate: editTask.dueDate || null,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update task"
                );
            }

            setShowEditModal(false);
            setEditingTask(null);

            await fetchProjectTasks();
        } catch (error) {
            console.error("Update task error:", error);
            setEditError(error.message);
        } finally {
            setUpdatingTask(false);
        }
    };

    const handleAssignTask = async () => {
        try {
            setAssignError("");

            if (!assigneeId.trim()) {
                setAssignError("User ID is required");
                return;
            }

            console.log("Assigning task:", assigningTask);
            console.log("Assignee ID:", assigneeId);

            setAssigning(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/tasks/${assigningTask._id}/assign`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        userId: assigneeId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to assign task"
                );
            }

            setShowAssignModal(false);
            setAssigningTask(null);
            setAssigneeId("");

            await fetchProjectTasks();
        } catch (error) {
            console.error("Assign task error:", error);
            setAssignError(error.message);
        } finally {
            setAssigning(false);
        }
    };

    const handleDeleteTask = async () => {
        try {
            setDeleteError("");
            setDeleting(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/tasks/${deletingTask._id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete task"
                );
            }

            setShowDeleteModal(false);
            setDeletingTask(null);

            await fetchProjectTasks();
        } catch (error) {
            console.error("Delete task error:", error);
            setDeleteError(error.message);
        } finally {
            setDeleting(false);
        }
    };

    const handlenavigatetodetail = async (taskid) => {
        navigate(`/projects/${taskid}/details`, { state: { navfrom: "project" } });
    }

    return (
        <AppLayout>
            <div className="min-h-screen p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">

                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => navigate("/projects")}
                            className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
                        >
                            <ArrowLeft size={18} />
                            Back to Projects
                        </button>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-indigo-600">
                                    Project
                                </p>

                                <h1 className="mt-1 text-3xl font-bold text-slate-900">
                                    Project Tasks
                                </h1>

                                <p className="mt-2 text-sm text-slate-500">
                                    Manage tasks for this project.
                                </p>
                            </div>

                            {isOwner && (
                                <button
                                    onClick={() => {
                                        setCreateError("");
                                        setShowCreateModal(true);
                                    }}
                                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
                                >
                                    <Plus size={18} />
                                    New Task
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="mb-8 grid gap-4 sm:grid-cols-3">

                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                    <Clock3 size={20} />
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500">
                                        Todo
                                    </p>

                                    <p className="text-2xl font-bold text-slate-900">
                                        {todoTasks.length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Clock3 size={20} />
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500">
                                        In Progress
                                    </p>

                                    <p className="text-2xl font-bold text-slate-900">
                                        {inProgressTasks.length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <CheckCircle2 size={20} />
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500">
                                        Completed
                                    </p>

                                    <p className="text-2xl font-bold text-slate-900">
                                        {completedTasks.length}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                            <p className="text-sm text-slate-500">
                                Loading tasks...
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Tasks */}
                    {!loading && !error && (
                        <div className="rounded-2xl border border-slate-200 bg-white">
                            <div className="border-b border-slate-100 px-6 py-5">
                                <h2 className="font-semibold text-slate-900">
                                    Project Tasks
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {tasks.length} task
                                    {tasks.length !== 1 ? "s" : ""}
                                </p>
                            </div>

                            {tasks.length === 0 ? (
                                <div className="py-16 text-center">
                                    <p className="font-medium text-slate-700">
                                        No tasks in this project
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Create a task to get started.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {tasks.map((task) => (
                                        <div
                                            key={task._id}
                                            className="grid md:justify-items-center  px-6 py-5 hover:bg-slate-50 md:grid-cols-[2fr_1fr_1fr] gap-4 cursor-pointer"
                                            onClick={() => handlenavigatetodetail(task._id)}
                                        >
                                            <div className="min-w-0 flex justify-self-start items-center">
                                                <div>

                                                    <h3 className="font-medium text-slate-900">
                                                        {task.title}
                                                    </h3>

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {task.description || "No description"}
                                                    </p>
                                                </div>
                                            </div>


                                            <div className="flex items-center gap-2">
                                                <div className=" ">
                                                    <h3 className="font-medium text-slate-900">
                                                        Assigned To:
                                                    </h3>

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {task.assignedTo?.name || "Unassigned"}
                                                    </p>

                                                </div>
                                            </div>


                                            <div className="ml-4 flex items-center gap-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${task.status === "done"
                                                        ? "bg-emerald-50 text-emerald-600"
                                                        : task.status === "in-progress"
                                                            ? "bg-blue-50 text-blue-600"
                                                            : "bg-amber-50 text-amber-600"
                                                        }`}
                                                >
                                                    {task.status === "in-progress"
                                                        ? "In Progress"
                                                        : task.status === "done"
                                                            ? "Done"
                                                            : "Todo"}
                                                </span>

                                                {/* Three dot menu */}
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();

                                                            setOpenMenu(
                                                                openMenu === task._id
                                                                    ? null
                                                                    : task._id
                                                            );
                                                        }}
                                                        className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                                    >
                                                        <MoreHorizontal size={19} />
                                                    </button>

                                                    {openMenu === task._id && (
                                                        <div
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="absolute right-0 top-10 z-30 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
                                                        >
                                                            {isOwner && (
                                                                <>
                                                                    <button
                                                                        onClick={() => {
                                                                            openEditModal(task);
                                                                            setOpenMenu(null);
                                                                        }}
                                                                        className=" cursor-pointer  flex w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                                                                    >
                                                                        Edit Task
                                                                    </button>

                                                                    <button
                                                                        onClick={() => {
                                                                            openAssignModal(task);
                                                                            setOpenMenu(null);
                                                                        }}
                                                                        className="cursor-pointer flex w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                                                                    >
                                                                        Assign Task
                                                                    </button>

                                                                    <button
                                                                        onClick={() => {
                                                                            openDeleteModal(task);
                                                                            setOpenMenu(null);
                                                                        }}
                                                                        className="cursor-pointer flex w-full px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                                                                    >
                                                                        Delete Task
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button
                                                                onClick={() => { openTaskDetails(task) }
                                                                }
                                                                className="cursor-pointer flex border-t border-slate-200 w-stretch items-center mx-3 pt-3 px-1 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                                                            >
                                                                Add comments
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>


                {showAssignModal && assigningTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

                            <h2 className="text-xl font-semibold text-slate-900">
                                Assign Task
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Assign "{assigningTask.title}" to a user.
                            </p>

                            {assignError && (
                                <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                                    {assignError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Assign To
                                </label>

                                <select
                                    value={assigneeId}
                                    onChange={(e) => setAssigneeId(e.target.value)}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-slate-900/10"
                                >
                                    <option value="">Unassigned</option>

                                    {workspaceMembers.map((member) => (
                                        <option key={member._id} value={member._id}>
                                            {member.name} — {member.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowAssignModal(false);
                                        setAssigningTask(null);
                                    }}
                                    disabled={assigning}
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleAssignTask}
                                    disabled={assigning}
                                    className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {assigning
                                        ? "Assigning..."
                                        : "Assign Task"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

                            <h2 className="text-xl font-semibold text-slate-900">
                                Create New Task
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Add a task to this project.
                            </p>

                            {createError && (
                                <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                                    {createError}
                                </div>
                            )}

                            {/* Title */}
                            <div className="mt-5">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Task Title
                                </label>

                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) =>
                                        setNewTask({
                                            ...newTask,
                                            title: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Build login page"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            {/* Description */}
                            <div className="mt-4">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    rows="3"
                                    value={newTask.description}
                                    onChange={(e) =>
                                        setNewTask({
                                            ...newTask,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Describe the task..."
                                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            {/*assign task*/}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Assign Task
                                </label>
                                <select
                                    value={newTask.assignedTo}
                                    onChange={(e) =>
                                        setNewTask({
                                            ...newTask,
                                            assignedTo: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                >
                                    <option value="">Select a member</option>
                                    {workspaceMembers.map((member) => (
                                        <option key={member._id} value={member._id}>
                                            {member.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Priority + Due Date */}
                            <div className="mt-4 grid grid-cols-2 gap-4">

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Priority
                                    </label>

                                    <select
                                        value={newTask.priority}
                                        onChange={(e) =>
                                            setNewTask({
                                                ...newTask,
                                                priority: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Due Date
                                    </label>

                                    <input
                                        type="date"
                                        value={newTask.dueDate}
                                        onChange={(e) =>
                                            setNewTask({
                                                ...newTask,
                                                dueDate: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>

                            </div>

                            {/* Buttons */}
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setCreateError("");
                                    }}
                                    disabled={creatingTask}
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleCreateTask}
                                    disabled={creatingTask}
                                    className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {creatingTask
                                        ? "Creating..."
                                        : "Create Task"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showEditModal && editingTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Edit Task
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Update your task details.
                                    </p>
                                </div>

                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="text-xl text-slate-400 hover:text-slate-700"
                                >
                                    ×
                                </button>
                            </div>

                            {editError && (
                                <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                                    {editError}
                                </div>
                            )}

                            <div className="mt-5">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Task Title
                                </label>

                                <input
                                    type="text"
                                    value={editTask.title}
                                    onChange={(e) =>
                                        setEditTask({
                                            ...editTask,
                                            title: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            <div className="mt-4">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    rows="3"
                                    value={editTask.description}
                                    onChange={(e) =>
                                        setEditTask({
                                            ...editTask,
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-4">


                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Priority
                                    </label>

                                    <select
                                        value={editTask.priority}
                                        onChange={(e) =>
                                            setEditTask({
                                                ...editTask,
                                                priority: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                            </div>

                            <div className="mt-4">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Due Date
                                </label>

                                <input
                                    type="date"
                                    value={editTask.dueDate}
                                    onChange={(e) =>
                                        setEditTask({
                                            ...editTask,
                                            dueDate: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingTask(null);
                                    }}
                                    disabled={updatingTask}
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleUpdateTask}
                                    disabled={updatingTask}
                                    className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {updatingTask
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showDeleteModal && deletingTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

                            <h2 className="text-xl font-semibold text-slate-900">
                                Delete Task?
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Are you sure you want to delete{" "}
                                <span className="font-medium text-slate-700">
                                    "{deletingTask.title}"
                                </span>
                                ?
                                <br />
                                This action cannot be undone.
                            </p>

                            {deleteError && (
                                <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                                    {deleteError}
                                </div>
                            )}

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeletingTask(null);
                                    }}
                                    disabled={deleting}
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleDeleteTask}
                                    disabled={deleting}
                                    className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    {deleting
                                        ? "Deleting..."
                                        : "Delete Task"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showTaskDetails && selectedTask && (
                    <div className="fixed inset-0 z-100 bg-black/40 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        {selectedTask.title}
                                    </h2>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Task Details
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        setShowTaskDetails(false);
                                        setSelectedTask(null);
                                    }}
                                    className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Task Information */}
                            <div className="p-6 space-y-5">

                                <div className="grid grid-cols-2 gap-4">

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Status
                                        </p>

                                        <p className="text-sm font-medium text-slate-900 mt-1">
                                            {selectedTask.status}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Priority
                                        </p>

                                        <p className="text-sm font-medium text-slate-900 mt-1">
                                            {selectedTask.priority}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Assigned To
                                        </p>

                                        <p className="text-sm font-medium text-slate-900 mt-1">
                                            {selectedTask.assignedTo?.name ||
                                                "Unassigned"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Due Date
                                        </p>

                                        <p className="text-sm font-medium text-slate-900 mt-1">
                                            {selectedTask.dueDate
                                                ? new Date(
                                                    selectedTask.dueDate
                                                ).toLocaleDateString()
                                                : "No due date"}
                                        </p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        Description
                                    </p>

                                    <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">
                                        {selectedTask.description ||
                                            "No description provided."}
                                    </p>
                                </div>

                                {/* Comments */}
                                <div className="border-t border-slate-200 pt-5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-slate-900">
                                            Comments
                                        </h3>

                                        <span className="text-xs text-slate-500">
                                            {comments.length}{" "}
                                            {comments.length === 1
                                                ? "comment"
                                                : "comments"}
                                        </span>
                                    </div>

                                    {/* Loading */}
                                    {loadingComments && (
                                        <div className="py-6 text-sm text-slate-500 text-center">
                                            Loading comments...
                                        </div>
                                    )}

                                    {/* Error */}
                                    {commentError && (
                                        <p className="text-sm text-red-500 mt-3">
                                            {commentError}
                                        </p>
                                    )}

                                    {/* Comment List */}
                                    {!loadingComments && comments.length === 0 && (
                                        <div className="py-6 text-center">
                                            <p className="text-sm text-slate-500">
                                                No comments yet.
                                            </p>

                                            <p className="text-xs text-slate-400 mt-1">
                                                Start the conversation.
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-4 mt-4">
                                        {comments.map((comment) => (
                                            <div
                                                key={comment._id}
                                                className="flex gap-3"
                                            >
                                                <div className="w-9 h-9 shrink-0 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-semibold">
                                                    {comment.user?.name
                                                        ?.charAt(0)
                                                        .toUpperCase() || "U"}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">
                                                                {comment.user?.name ||
                                                                    "Unknown User"}
                                                            </p>

                                                            <p className="text-xs text-slate-400">
                                                                {new Date(
                                                                    comment.createdAt
                                                                ).toLocaleString()}
                                                            </p>
                                                        </div>

                                                        {comment.user?._id ===
                                                            user?._id && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleDeleteComment(
                                                                            comment._id
                                                                        )
                                                                    }
                                                                    className="cursor-pointer text-xs text-red-500 hover:text-red-600"
                                                                >
                                                                    Delete
                                                                </button>
                                                            )}
                                                    </div>

                                                    <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">
                                                        {comment.text}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Comment */}
                                    <div className="mt-5">
                                        <textarea
                                            value={commentText}
                                            onChange={(e) =>
                                                setCommentText(e.target.value)
                                            }
                                            placeholder="Write a comment..."
                                            rows={3}
                                            maxLength={1000}
                                            className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                        />

                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-slate-400">
                                                {commentText.length}/1000
                                            </span>

                                            <button
                                                onClick={() =>
                                                    handleAddComment(
                                                        selectedTask._id
                                                    )
                                                }
                                                disabled={
                                                    addingComment ||
                                                    !commentText.trim()
                                                }
                                                className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {addingComment
                                                    ? "Adding..."
                                                    : "Add Comment"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AppLayout >
    );
};

export default ProjectDetails;