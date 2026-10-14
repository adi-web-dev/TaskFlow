import { useEffect, useState } from "react";
import {
    ArrowLeft,
    CalendarDays,
    CircleCheck,
    Clock3,
    Flag,
    FolderKanban,
    User,
    Activity as ActivityIcon,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";

const TaskDetails = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();

    const { user } = useAuth();

    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // const [openMenu, setOpenMenu] = useState(null);

    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);
    const [addingComment, setAddingComment] = useState(false);
    const [commentError, setCommentError] = useState("");

    const [activities, setActivities] = useState([]);
    const [activityLoading, setActivityLoading] = useState(false);

    useEffect(() => {
        if (taskId) {
            fetchTaskDetails(taskId);
        }
    }, [taskId]);

    useEffect(() => {
        if (taskId) {
            fetchActivities(taskId);
        }
    }, [comments])

    const fetchTaskDetails = async (taskId) => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            console.log("fetching task")

            const response = await fetch(
                `http://localhost:5000/api/tasks/${taskId}/details`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch task details"
                );
            }

            setSelectedTask(data.task);
            console.log(data.task)
            setCommentText("");
            setCommentError("");

            fetchComments(taskId);
            fetchActivities(taskId);
        } catch (error) {
            console.error("Fetch task details error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
            console.log(loading)
        }
    };

    const fetchComments = async (taskId) => {
        try {
            setLoadingComments(true);
            setCommentError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/tasks/${taskId}/comments`,
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

    const fetchActivities = async (taskId) => {
        try {
            setActivityLoading(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/tasks/${taskId}/activity`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch activity"
                );
            }

            setActivities(data.activities || []);
        } catch (error) {
            console.error("Fetch activities error:", error);
        } finally {
            setActivityLoading(false);
        }
    };

    const handleAddComment = async (taskId) => {
        if (!commentText.trim()) return;

        try {
            setAddingComment(true);
            setCommentError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/tasks/${taskId}/comments`,
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
                `http://localhost:5000/api/comments/${commentId}`,
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

    // const backnavigate = () => {
    // if (window.history.state && window.history.state.usr && window.history.state.usr.navfrom === "project") {
    //     navigate(-1);
    // } else {
    //     navigate("/task");
    // }

    //     if (location.state?.navfrom === "project") {
    //         navigate(-1);
    //     } else if (location.state?.navfrom === "task") {
    //         navigate("/tasks");
    //     }
    // };


    return (
        <AppLayout>
            <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">

                    {/* Back */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>

                    {/* Loading */}
                    {loading && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                            <p className="text-sm text-slate-500">
                                Loading task...
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {!loading && !error && selectedTask && (
                        <>
                            {/* ================= HEADER ================= */}
                            <div className="mb-7">
                                <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-indigo-600">
                                    <span>Task</span>

                                    {selectedTask.project?.name && (
                                        <>
                                            <span className="text-slate-300">
                                                /
                                            </span>

                                            <span className="text-slate-500 normal-case tracking-normal">
                                                {selectedTask.project.name}
                                            </span>
                                        </>
                                    )}
                                </div>

                                <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                            {selectedTask.title}
                                        </h1>

                                        <p className="mt-2 text-sm text-slate-500">
                                            Task details, activity and discussion
                                        </p>
                                    </div>

                                    
                                </div>
                            </div>

                            {/* ================= MAIN GRID ================= */}
                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">

                                {/* ================= LEFT ================= */}
                                <div className="space-y-6">

                                    {/* Description */}
                                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <div className="mb-4 flex items-center gap-2">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                                                <FolderKanban
                                                    size={17}
                                                    className="text-indigo-600"
                                                />
                                            </div>

                                            <h2 className="font-semibold text-slate-900">
                                                Description
                                            </h2>
                                        </div>

                                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                            {selectedTask.description ||
                                                "No description provided."}
                                        </p>
                                    </section>

                                    {/* Comments */}
                                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="font-semibold text-slate-900">
                                                    Comments
                                                </h2>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    Discuss this task with your team
                                                </p>
                                            </div>

                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                                {comments.length}
                                            </span>
                                        </div>

                                        {commentError && (
                                            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                                {commentError}
                                            </p>
                                        )}

                                        {loadingComments ? (
                                            <div className="py-8 text-center text-sm text-slate-500">
                                                Loading comments...
                                            </div>
                                        ) : (
                                            <div className="mt-6 space-y-5">
                                                {comments.length === 0 ? (
                                                    <div className="rounded-xl bg-slate-50 p-6 text-center">
                                                        <p className="text-sm text-slate-500">
                                                            No comments yet.
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            Start the conversation.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    comments.map(
                                                        (comment) => (
                                                            <div
                                                                key={
                                                                    comment._id
                                                                }
                                                                className="flex gap-3"
                                                            >
                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
                                                                    {comment.user?.name
                                                                        ?.charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase() ||
                                                                        "U"}
                                                                </div>

                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-start justify-between gap-3">
                                                                        <div>
                                                                            <p className="text-sm font-semibold text-slate-900">
                                                                                {comment
                                                                                    .user
                                                                                    ?.name ||
                                                                                    "Unknown User"}
                                                                            </p>

                                                                            <p className="text-xs text-slate-400">
                                                                                {new Date(
                                                                                    comment.createdAt
                                                                                ).toLocaleString()}
                                                                            </p>
                                                                        </div>

                                                                        {comment
                                                                            .user
                                                                            ?._id ===
                                                                            user?._id && (
                                                                                <button
                                                                                    onClick={() =>
                                                                                        handleDeleteComment(
                                                                                            comment._id
                                                                                        )
                                                                                    }
                                                                                    className="text-xs font-medium text-red-500 hover:text-red-600"
                                                                                >
                                                                                    Delete
                                                                                </button>
                                                                            )}
                                                                    </div>

                                                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                                                        {
                                                                            comment.text
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )
                                                    )
                                                )}
                                            </div>
                                        )}

                                        {/* Add Comment */}
                                        <div className="mt-6 border-t border-slate-100 pt-5">
                                            <textarea
                                                value={commentText}
                                                onChange={(e) =>
                                                    setCommentText(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Write a comment..."
                                                rows={3}
                                                maxLength={1000}
                                                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                            />

                                            <div className="mt-2 flex items-center justify-between">
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
                                                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {addingComment
                                                        ? "Adding..."
                                                        : "Add Comment"}
                                                </button>
                                            </div>
                                        </div>
                                    </section>

                                    
                                    {/* Activity */}
                                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <div className="mb-6 flex items-center gap-2">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
                                                <ActivityIcon
                                                    size={17}
                                                    className="text-violet-600"
                                                />
                                            </div>

                                            <div>
                                                <h2 className="font-semibold text-slate-900">
                                                    Activity
                                                </h2>

                                                <p className="text-xs text-slate-500">
                                                    Task history
                                                </p>
                                            </div>
                                        </div>

                                        {activityLoading ? (
                                            <div className="space-y-4">
                                                {[1, 2, 3].map((item) => (
                                                    <div
                                                        key={item}
                                                        className="h-12 animate-pulse rounded-xl bg-slate-100"
                                                    />
                                                ))}
                                            </div>
                                        ) : activities.length === 0 ? (
                                            <div className="rounded-xl bg-slate-50 p-6 text-center">
                                                <p className="text-sm text-slate-500">
                                                    No activity yet.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="relative ml-2">
                                                <div className="absolute bottom-0 left-[7px] top-0 w-px bg-slate-200" />

                                                <div className="space-y-6">
                                                    {activities.map(
                                                        (activity) => (
                                                            <div
                                                                key={
                                                                    activity._id
                                                                }
                                                                className="relative flex gap-4"
                                                            >
                                                                <div className="relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-white bg-violet-500 shadow-sm" />

                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                                                        <p className="text-sm text-slate-700">
                                                                            <span className="font-semibold text-slate-900">
                                                                                {
                                                                                    activity
                                                                                        .user
                                                                                        ?.name
                                                                                }
                                                                            </span>{" "}
                                                                            {
                                                                                activity.message
                                                                            }
                                                                        </p>

                                                                        <span className="shrink-0 text-xs text-slate-400">
                                                                            {new Date(
                                                                                activity.createdAt
                                                                            ).toLocaleString()}
                                                                        </span>
                                                                    </div>

                                                                    {activity.type ===
                                                                        "status_changed" &&
                                                                        activity.metadata
                                                                            ?.oldStatus && (
                                                                            <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs">
                                                                                <span className="capitalize text-slate-500">
                                                                                    {activity.metadata.oldStatus.replace(
                                                                                        "-",
                                                                                        " "
                                                                                    )}
                                                                                </span>

                                                                                <span className="text-slate-400">
                                                                                    →
                                                                                </span>

                                                                                <span className="font-medium capitalize text-slate-700">
                                                                                    {activity.metadata.newStatus.replace(
                                                                                        "-",
                                                                                        " "
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                        )}

                                                                    {activity.type ===
                                                                        "priority_changed" &&
                                                                        activity.metadata
                                                                            ?.oldPriority && (
                                                                            <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs">
                                                                                <span className="capitalize text-slate-500">
                                                                                    {activity.metadata.oldPriority}
                                                                                </span>

                                                                                <span className="text-slate-400">
                                                                                    →
                                                                                </span>

                                                                                <span className="font-medium capitalize text-slate-700">
                                                                                    {activity.metadata.newPriority}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </section>

                                </div>

                                {/* ================= RIGHT ================= */}
                                <aside className="h-fit space-y-6 xl:sticky xl:top-6">

                                    {/* Task Information */}
                                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <h2 className="mb-5 font-semibold text-slate-900">
                                            Task Information
                                        </h2>

                                        <div className="space-y-5">

                                            {/* Status */}
                                            <div className="flex items-start gap-3">
                                                <CircleCheck
                                                    size={18}
                                                    className="mt-0.5 text-indigo-500"
                                                />

                                                <div>
                                                    <p className="text-xs text-slate-400">
                                                        Status
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium capitalize text-slate-800">
                                                        {selectedTask.status.replace(
                                                            "-",
                                                            " "
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Priority */}
                                            <div className="flex items-start gap-3">
                                                <Flag
                                                    size={18}
                                                    className="mt-0.5 text-amber-500"
                                                />

                                                <div>
                                                    <p className="text-xs text-slate-400">
                                                        Priority
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium capitalize text-slate-800">
                                                        {selectedTask.priority}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Assignee */}
                                            <div className="flex items-start gap-3">
                                                <User
                                                    size={18}
                                                    className="mt-0.5 text-violet-500"
                                                />

                                                <div>
                                                    <p className="text-xs text-slate-400">
                                                        Assigned To
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                                        {selectedTask.assignedTo
                                                            ?.name ||
                                                            "Unassigned"}
                                                    </p>

                                                    {selectedTask.assignedTo
                                                        ?.email && (
                                                            <p className="mt-0.5 text-xs text-slate-400">
                                                                {
                                                                    selectedTask
                                                                        .assignedTo
                                                                        .email
                                                                }
                                                            </p>
                                                        )}
                                                </div>
                                            </div>

                                            {/* Due Date */}
                                            <div className="flex items-start gap-3">
                                                <CalendarDays
                                                    size={18}
                                                    className="mt-0.5 text-red-500"
                                                />

                                                <div>
                                                    <p className="text-xs text-slate-400">
                                                        Due Date
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                                        {selectedTask.dueDate
                                                            ? new Date(
                                                                selectedTask.dueDate
                                                            ).toLocaleDateString()
                                                            : "No due date"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Project */}
                                            <div className="flex items-start gap-3">
                                                <FolderKanban
                                                    size={18}
                                                    className="mt-0.5 text-indigo-500"
                                                />

                                                <div>
                                                    <p className="text-xs text-slate-400">
                                                        Project
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                                        {selectedTask.project
                                                            ?.name ||
                                                            "No project"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Created By */}
                                            <div className="flex items-start gap-3">
                                                <User
                                                    size={18}
                                                    className="mt-0.5 text-slate-400"
                                                />

                                                <div>
                                                    <p className="text-xs text-slate-400">
                                                        Created By
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                                        {selectedTask.createdBy
                                                            ?.name ||
                                                            "Unknown"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Created Date */}
                                            {selectedTask.createdAt && (
                                                <div className="flex items-start gap-3">
                                                    <Clock3
                                                        size={18}
                                                        className="mt-0.5 text-slate-400"
                                                    />

                                                    <div>
                                                        <p className="text-xs text-slate-400">
                                                            Created
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-slate-800">
                                                            {new Date(
                                                                selectedTask.createdAt
                                                            ).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </aside>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

export default TaskDetails;