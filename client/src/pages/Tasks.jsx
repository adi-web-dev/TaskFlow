import { useEffect, useState } from "react";

import {
    Plus,
    Search,
    SlidersHorizontal,
    MoreHorizontal,
    CalendarDays,
    CircleCheck,
    Clock3,
    CircleAlert,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import AppLayout from "../components/AppLayout";

const Tasks = () => {
    const { activeWorkspace, loading: workspaceLoading } = useWorkspace();
    const { isOwner } = useWorkspace();
    const navigate = useNavigate();

    if (isOwner) {
        return navigate("/Dashboard")
    }

    const [workspaceMembers, setWorkspaceMembers] = useState([]);

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [statusError, setStatusError] = useState("");

    const [openMenu, setOpenMenu] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");

    const workspaceId = activeWorkspace?._id;
    useEffect(() => {
        if (!workspaceId) return;
        fetchMyTasks();
    }, [workspaceId]);


    // useEffect(() => {
    //     const handleClickOutside = () => {
    //         setOpenMenu(null);
    //     };
    //     document.addEventListener("click", handleClickOutside);
    //     return () => {
    //         document.removeEventListener("click", handleClickOutside);
    //     };
    // }, []);

    const fetchMyTasks = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/tasks/${workspaceId}/my-tasks`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch tasks"
                );
            }

            setTasks(data.tasks || []);
        } catch (error) {
            console.error("Fetch tasks error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const totalTasks = tasks.length;

    const todoTasks = tasks.filter(
        (task) => task.status === "todo"
    ).length;

    const inProgressTasks = tasks.filter(
        (task) => task.status === "in-progress"
    ).length;

    const completedTasks = tasks.filter(
        (task) => task.status === "done"
    ).length;

    const filteredTasks = tasks.filter((task) => {
        const matchesSearch =
            task.title.toLowerCase().includes(search.toLowerCase()) ||
            task.description?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === "All Status" ||
            task.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleStatusChange = async (taskId, status) => {
        try {
            setUpdatingStatus(taskId);
            setStatusError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/tasks/${taskId}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        status,
                    }),
                }
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update task status"
                );
            }

            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task._id === taskId
                        ? {
                            ...task,
                            status: data.task.status,
                        }
                        : task
                )
            );
        } catch (error) {
            console.error("Update status error:", error);
            setStatusError(error.message);
        } finally {
            setUpdatingStatus(null);
        }
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#f8f9fc] text-slate-900">

                {/* Header */}
                <header className="border-b border-slate-200 bg-white">
                    <div className="flex items-center justify-between px-5 py-6 sm:px-8">

                        <div>
                            <p className="text-sm font-medium text-indigo-600">
                                Task Management
                            </p>

                            <h1 className="mt-1 text-2xl font-bold tracking-tight">
                                My Tasks
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Manage and track your assigned tasks.
                            </p>
                        </div>

                        

                    </div>
                </header>


                {/* Content */}
                <main className="p-5 sm:p-8">

                    {/* Filters */}
                    <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                        {/* Search */}
                        <div className="flex w-full max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5">

                            <Search
                                size={18}
                                className="text-slate-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search tasks..."
                                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                            />

                        </div>


                        <div className="flex gap-3">

                            <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                                <SlidersHorizontal size={17} />
                                Filter
                            </button>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 outline-none"
                            >
                                <option value="All Status">All Status</option>
                                <option value="todo">Todo</option>
                                <option value="in-progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>

                        </div>

                    </div>


                    {/* Stats */}
                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                    <CalendarDays size={19} />
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Total
                                    </p>

                                    <p className="text-xl font-bold">
                                        {totalTasks}
                                    </p>
                                </div>
                            </div>
                        </div>


                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                    <Clock3 size={19} />
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Todo
                                    </p>

                                    <p className="text-xl font-bold">
                                        {todoTasks}
                                    </p>
                                </div>
                            </div>
                        </div>


                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Clock3 size={19} />
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400">
                                        In Progress
                                    </p>

                                    <p className="text-xl font-bold">
                                        {inProgressTasks}
                                    </p>
                                </div>
                            </div>
                        </div>


                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <CircleCheck size={19} />
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Completed
                                    </p>

                                    <p className="text-xl font-bold">
                                        {completedTasks}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>


                    {/* Task Table */}
                    {loading ? (
                        <div className="p-8 text-center text-sm text-slate-500">
                            Loading tasks...
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-sm text-red-500">
                            {error}
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-500">
                            No tasks assigned to you yet.
                        </div>
                    ) : (
                        <div className=" divide-y divide-slate-800 rounded-2xl border border-slate-200 bg-white">
                            {filteredTasks.map((task) => (
                                <div
                                    key={task._id}
                                    onClick={(e) => {

                                        navigate(`/tasks/${task._id}/details`, { state: { navfrom: "task" } })
                                    }}
                                    className={"grid gap-4 md:justify-items-center border-b border-slate-100 px-6 py-5 transition hover:bg-slate-50 md:items-center md:grid-cols-[2fr_1fr_1fr_1fr]"
                                    }
                                >

                                    {/* Task */}
                                    <div className="flex justify-self-start items-center gap-3">

                                        <div
                                            className={`h-5 w-5 rounded-full border-2 ${task.status === "done"
                                                ? "border-emerald-500 bg-emerald-500"
                                                : "border-slate-300"
                                                }`}
                                        />

                                        <div>
                                            <p
                                                className={`text-sm font-semibold ${task.status === "done"
                                                    ? "text-slate-400 line-through"
                                                    : "text-slate-900"
                                                    }`}
                                            >
                                                {task.title}
                                            </p>

                                            {task.dueDate && (
                                                <p className="mt-1 text-xs text-slate-400">
                                                    Due{" "}
                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>

                                    </div>


                                    {/* Project */}
                                    <span className="text-sm text-slate-500">
                                        {task.project?.name || "No Project"}
                                    </span>


                                    {/* Priority */}
                                    <span
                                        className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${task.priority === "high"
                                            ? "bg-red-50 text-red-600"
                                            : task.priority === "medium"
                                                ? "bg-amber-50 text-amber-600"
                                                : "bg-slate-100 text-slate-500"
                                            }`}
                                    >
                                        {task.priority || "Medium"}
                                    </span>


                                    {/* Status */}
                                    <select

                                        value={task.status}
                                        disabled={updatingStatus === task._id}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => {
                                            handleStatusChange(task._id, e.target.value)
                                        }}
                                        className={`w-fit text-xs font-medium rounded-full px-2 py-1.5 border outline-none cursor-pointer ${task.status === "todo"
                                            ? "bg-slate-100 text-slate-600 border-slate-200"
                                            : task.status === "in-progress"
                                                ? "bg-blue-50 text-blue-600 border-blue-200"
                                                : "bg-green-50 text-green-600 border-green-200"
                                            } ${updatingStatus === task._id
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                            }`}>
                                        <option value="todo">To Do</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="done">Done</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
                </div>
        </AppLayout>
    );
};

export default Tasks;