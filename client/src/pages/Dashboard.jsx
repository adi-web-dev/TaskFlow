import * as d3 from "d3";

import {
    LayoutDashboard,
    CheckSquare,
    FolderKanban,
    Users,
    Settings,
    Search,
    Bell,
    Plus,
    ChevronDown,
    ArrowUpRight,
    MoreHorizontal,
    Clock3,
    CircleCheck,
    CircleAlert,
    ListTodo,
    CalendarDays,
    Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";

import AppLayout from "../components/AppLayout";
import { Link } from "react-router-dom";

const Dashboard = () => {
    const chartRef = useRef(null);

    const { activeWorkspace, loading: workspaceLoading } = useWorkspace();
    const { isOwner } = useWorkspace();

    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    const [tasks, setTasks] = useState([]);

    const [creatingTask, setCreatingTask] = useState(false);
    const [createError, setCreateError] = useState("");

    const [openMenu, setOpenMenu] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [workspaceMembers, setWorkspaceMembers] = useState([]);
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        projectId: "",
        assignedTo: "",
        priority: "medium",
        dueDate: "",
    });

    const workspaceId = activeWorkspace?._id;
    console.log("Active Workspace ID:", workspaceId);
    const fetchTasks = async () => {

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/tasks/${workspaceId}/my-tasks`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch tasks");
            }

            setTasks(data.tasks);
        } catch (error) {
            console.error("Dashboard tasks error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading || workspaceLoading || !user || !workspaceId) {
            return;
        }

        let cancelled = false;

        const loadDashboard = async () => {
            setLoading(true);

            try {
                await Promise.all([fetchTasks(), fetchMembers()]);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadDashboard();

        return () => {
            cancelled = true;
        };
    }, [authLoading, workspaceLoading, user, workspaceId]);



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


    useEffect(() => {
        if (!chartRef.current) return;

        const container = chartRef.current;
        const root = d3.select(container);

        root.selectAll("*").remove();

        const data = [
            { label: "To Do", value: todoTasks, color: "#6366f1" },
            { label: "In Progress", value: inProgressTasks, color: "#3b82f6" },
            { label: "Completed", value: completedTasks, color: "#10b981" },
        ];

        const height = 310;
        const margin = { top: 30, right: 18, bottom: 48, left: 38 };

        const drawChart = () => {
            root.selectAll("svg").remove();

            const width = Math.max(container.clientWidth, 280);
            const innerWidth = width - margin.left - margin.right;
            const innerHeight = height - margin.top - margin.bottom;
            const baseline = margin.top + innerHeight;

            const maxValue = d3.max(data, (d) => d.value) || 0;
            const yMax = Math.max(4, Math.ceil(maxValue / 2) * 2);

            const x = d3
                .scaleBand()
                .domain(data.map((d) => d.label))
                .range([margin.left, width - margin.right])
                .padding(0.42);

            const y = d3
                .scaleLinear()
                .domain([0, yMax])
                .range([baseline, margin.top]);

            const svg = root
                .append("svg")
                .attr("width", "100%")
                .attr("viewBox", `0 0 ${width} ${height}`)
                .attr("preserveAspectRatio", "xMidYMid meet")
                .style("display", "block")
                .style("overflow", "visible");

            // Subtle horizontal grid lines
            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(
                    d3.axisLeft(y)
                        .ticks(4)
                        .tickSize(-innerWidth)
                        .tickFormat((d) => d)
                )
                .call((g) => g.select(".domain").remove())
                .call((g) =>
                    g.selectAll(".tick line")
                        .attr("stroke", "#e9edf5")
                        .attr("stroke-dasharray", "3,5")
                )
                .call((g) =>
                    g.selectAll(".tick text")
                        .attr("fill", "#94a3b8")
                        .attr("font-size", "11px")
                        .attr("dx", "-5px")
                );

            // Clean bottom axis
            svg.append("g")
                .attr("transform", `translate(0,${baseline})`)
                .call(d3.axisBottom(x).tickSize(0))
                .call((g) => g.select(".domain").remove())
                .call((g) =>
                    g.selectAll(".tick text")
                        .attr("fill", "#64748b")
                        .attr("font-size", width < 400 ? "10px" : "12px")
                        .attr("font-weight", "500")
                        .attr("dy", "1.8em")
                );

            // Bars with rounded corners and animated growth
            const bars = svg
                .append("g")
                .selectAll("rect")
                .data(data)
                .join("rect")
                .attr("x", (d) => x(d.label))
                .attr("y", baseline)
                .attr("width", x.bandwidth())
                .attr("height", 0)
                .attr("rx", 7)
                .attr("fill", (d) => d.color)
                .style("cursor", "pointer")
                .style("transition", "filter 160ms ease");

            bars.append("title").text(
                (d) => `${d.label}: ${d.value} task${d.value === 1 ? "" : "s"}`
            );

            bars.transition()
                .duration(650)
                .ease(d3.easeCubicOut)
                .attr("y", (d) => y(d.value))
                .attr("height", (d) => Math.max(0, baseline - y(d.value)));

            bars
                .on("mouseenter", function () {
                    d3.select(this)
                        .style("filter", "brightness(0.92)");
                })
                .on("mouseleave", function () {
                    d3.select(this).style("filter", null);
                });

            // Values above bars
            svg.append("g")
                .selectAll("text")
                .data(data)
                .join("text")
                .attr("x", (d) => x(d.label) + x.bandwidth() / 2)
                .attr("y", (d) => Math.max(margin.top - 8, y(d.value) - 12))
                .attr("text-anchor", "middle")
                .attr("fill", "#1e293b")
                .attr("font-size", "13px")
                .attr("font-weight", "700")
                .text((d) => d.value);
        };

        drawChart();

        // Redraw when the chart container changes size
        const resizeObserver = new ResizeObserver(() => {
            drawChart();
        });

        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
            root.selectAll("*").remove();
        };
    }, [todoTasks, inProgressTasks, completedTasks]);


    const fetchMembers = async () => {

        try {
            const token = localStorage.getItem("token");



            const response = await fetch(
                `http://localhost:5000/api/workspaces/${workspaceId}/members`,
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

            if (!newTask.projectId.trim()) {
                setCreateError("Project ID is required");
                return;
            }

            setCreatingTask(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/projects/${newTask.projectId}/tasks`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: newTask.title,
                        description: newTask.description,
                        priority: newTask.priority,
                        assignedTo: newTask.assignedTo || null,
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
                projectId: "",
                priority: "medium",
                dueDate: "",
                assignedTo: "",
            });

            // Refresh my tasks after creation
            await fetchTasks();

        } catch (error) {
            console.error("Create task error:", error);
            setCreateError(error.message);
        } finally {
            setCreatingTask(false);
        }
    };

    const overdueTasks = tasks.filter((task) => {
        if (!task.dueDate || task.status === "done") {
            return false;
        }

        return new Date(task.dueDate) < new Date();
    }).length;

    const completionRate =
        totalTasks === 0
            ? 0
            : Math.round((completedTasks / totalTasks) * 100);


    const highPriorityTasks = tasks.filter(
        (task) => task.priority === "high"
    ).length;

    const mediumPriorityTasks = tasks.filter(
        (task) => task.priority === "medium"
    ).length;

    const lowPriorityTasks = tasks.filter(
        (task) => task.priority === "low"
    ).length;


    return (
        <AppLayout>
            <div className="min-h-screen bg-[#f8f9fc] text-slate-900">

                {/* ================= MAIN ================= */}
                <div className="">

                    {/* ================= TOP NAVBAR ================= */}
                    <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur-md sm:px-8">

                        {/* Search */}
                        <div className="flex w-full max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition focus-within:border-indigo-400 focus-within:bg-white">

                            <Search size={18} className="text-slate-400" />

                            <input
                                type="text"
                                placeholder="Search tasks, projects..."
                                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                            />

                            <div className="hidden w-18 rounded-md border border-slate-200 bg-white px-2 py-0.5 font-medium text-slate-400 sm:block">
                                Ctrl K
                            </div>

                        </div>


                        {/* Right */}
                        <div className="ml-5 flex items-center gap-4">

                            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">

                                <Bell size={19} />

                                <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />

                            </button>

                            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

                            <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                                    A
                                </div>

                                <div className="hidden sm:block">
                                    <p className="text-sm font-semibold">
                                        {user?.name}
                                    </p>

                                    <p className="text-xs text-slate-400">
                                        Workspace {isOwner ? "Owner" : "Member"}
                                    </p>
                                </div>

                                <ChevronDown
                                    size={16}
                                    className="hidden text-slate-400 sm:block"
                                />

                            </div>

                        </div>
                    </header>


                    {/* ================= CONTENT ================= */}
                    <main className="p-5 sm:p-8">

                        {/* Heading */}
                        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                            <div>
                                <div className="mb-2 flex items-center gap-2">
                                    <p className="text-sm font-medium text-indigo-600">
                                        Overview
                                    </p>

                                    <span className="h-1 w-1 rounded-full bg-slate-300" />

                                    <p className="text-sm text-slate-400">
                                        Saturday, August 22
                                    </p>
                                </div>

                                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                    Good evening, {user?.name} 👋
                                </h2>

                                <p className="mt-1.5 text-sm text-slate-500">
                                    Here's what's happening with your projects today.
                                </p>
                            </div>

                            {isOwner && (

                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-indigo-300">

                                    <Plus size={18} />

                                    New Task

                                </button>
                            )}

                        </div>


                        {/* ================= STAT CARDS ================= */}
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                            {/* Total */}
                            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

                                <div className="flex items-start justify-between">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        <ListTodo size={21} />
                                    </div>

                                    <button className="text-slate-300 transition group-hover:text-slate-500">
                                        <MoreHorizontal size={19} />
                                    </button>

                                </div>

                                <p className="mt-5 text-sm text-slate-500">
                                    Total Tasks
                                </p>

                                <div className="mt-1 flex items-end gap-3">

                                    <h3 className="text-3xl font-bold tracking-tight">
                                        <p>{totalTasks}</p>
                                    </h3>



                                </div>

                                <p className="mt-1 text-xs text-slate-400">
                                    Across all projects
                                </p>

                            </div>


                            {/* Completed */}
                            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

                                <div className="flex items-start justify-between">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                        <CircleCheck size={21} />
                                    </div>

                                    <button className="text-slate-300 transition group-hover:text-slate-500">
                                        <MoreHorizontal size={19} />
                                    </button>

                                </div>

                                <p className="mt-5 text-sm text-slate-500">
                                    Completed
                                </p>

                                <div className="mt-1 flex items-end gap-3">

                                    <h3 className="text-3xl font-bold tracking-tight">
                                        {completedTasks}
                                    </h3>



                                </div>

                                <p className="mt-1 text-xs text-slate-400">
                                    {completionRate}% completion rate
                                </p>

                            </div>


                            {/* Progress */}
                            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

                                <div className="flex items-start justify-between">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <Clock3 size={21} />
                                    </div>

                                    <button className="text-slate-300 transition group-hover:text-slate-500">
                                        <MoreHorizontal size={19} />
                                    </button>

                                </div>

                                <p className="mt-5 text-sm text-slate-500">
                                    In Progress
                                </p>

                                <div className="mt-1 flex items-end gap-3">

                                    <h3 className="text-3xl font-bold tracking-tight">
                                        {inProgressTasks}
                                    </h3>



                                </div>

                                <p className="mt-1 text-xs text-slate-400">
                                    Currently active
                                </p>

                            </div>


                            {/* Overdue */}
                            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

                                <div className="flex items-start justify-between">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                                        <CircleAlert size={21} />
                                    </div>

                                    <button className="text-slate-300 transition group-hover:text-slate-500">
                                        <MoreHorizontal size={19} />
                                    </button>

                                </div>

                                <p className="mt-5 text-sm text-slate-500">
                                    Overdue
                                </p>

                                <div className="mt-1 flex items-end gap-3">

                                    <h3 className="text-3xl font-bold tracking-tight">
                                        {overdueTasks}
                                    </h3>

                                    <span className="mb-1 text-xs font-semibold text-red-500">
                                        Needs attention
                                    </span>

                                </div>

                                <p className="mt-1 text-xs text-slate-400">
                                    Past their due date
                                </p>

                            </div>

                        </div>


                        {/* ================= ANALYTICS + RECENT ================= */}
                        <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">

                            {/* Analytics */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                                <div className="flex items-start justify-between">

                                    <div>
                                        <h3 className="font-semibold text-slate-900">
                                            Task Analytics
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Your team's task completion overview
                                        </p>
                                    </div>



                                </div>


                                <div
                                    ref={chartRef}
                                    className="w-full mt-6 overflow-hidden"
                                />


                                {/* Bottom stats */}
                                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-100 pt-5  text-center \">

                                    <div>
                                        <p className="text-xs text-slate-400">
                                            Completed
                                        </p>

                                        <p className="mt-1 text-lg font-bold">
                                            12
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-400">
                                            In Progress
                                        </p>

                                        <p className="mt-1 text-lg font-bold">
                                            7
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-400">
                                            Completion
                                        </p>

                                        <p className="mt-1 text-lg font-bold text-emerald-600">
                                            {completionRate}%
                                        </p>
                                    </div>

                                </div>

                            </div>


                            {/* Recent Tasks */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                                <div className="flex items-center justify-between">

                                    <div>
                                        <h3 className="font-semibold text-slate-900">
                                            Recent Tasks
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Latest activity
                                        </p>
                                    </div>

                                    <Link to="/tasks"
                                        className="text-xs font-semibold text-indigo-600 hover:underline">
                                        View all
                                    </Link>

                                </div>


                                <div className="mt-6 space-y-2">

                                    <div className="space-y-4">
                                        {loading ? (
                                            <p className="text-slate-500">
                                                Loading tasks...
                                            </p>
                                        ) : tasks.length === 0 ? (
                                            <p className="text-slate-500">
                                                No tasks assigned to you yet.
                                            </p>
                                        ) : (
                                            tasks.slice(0, 5).map((task) => (
                                                <div
                                                    key={task._id}
                                                    className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition"
                                                >
                                                    <div>
                                                        <h3 className="font-medium text-slate-900">
                                                            {task.title}
                                                        </h3>

                                                        <p className="text-sm text-slate-500 mt-1">
                                                            {task.project?.name || "No project"}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`px-3 py-1 rounded-lg text-xs font-medium ${task.status === "done"
                                                            ? "bg-green-100 text-green-700"
                                                            : task.status === "in-progress"
                                                                ? "bg-blue-100 text-blue-700"
                                                                : "bg-slate-100 text-slate-600"
                                                            }`}
                                                    >
                                                        {task.status === "in-progress"
                                                            ? "In Progress"
                                                            : task.status === "done"
                                                                ? "Completed"
                                                                : "To Do"}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                            </div>

                        </div>

                    </main>
                </div>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">

                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Create New Task
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Add a task to your project.
                                    </p>
                                </div>

                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="cursor-pointer text-xl text-slate-400 hover:text-slate-700"
                                >
                                    ×
                                </button>
                            </div>

                            {createError && (
                                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {createError}
                                </div>
                            )}

                            <div className="space-y-4">

                                {/* Title */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Task title
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
                                        placeholder="e.g. Build Login Page"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Description
                                    </label>

                                    <textarea
                                        value={newTask.description}
                                        onChange={(e) =>
                                            setNewTask({
                                                ...newTask,
                                                description: e.target.value,
                                            })
                                        }
                                        placeholder="Describe the task..."
                                        rows="3"
                                        className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                                    />
                                </div>

                                {/* Project ID */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Project ID
                                    </label>

                                    <input
                                        type="text"
                                        value={newTask.projectId}
                                        onChange={(e) =>
                                            setNewTask({
                                                ...newTask,
                                                projectId: e.target.value,
                                            })
                                        }
                                        placeholder="Enter project ID"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                                    />
                                </div>



                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Assign To
                                    </label>

                                    <select
                                        value={newTask.assignedTo || ""}
                                        onChange={(e) =>
                                            setNewTask({
                                                ...newTask,
                                                assignedTo: e.target.value,
                                            })
                                        }
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

                                {/* Priority + Due Date */}
                                <div className="grid grid-cols-2 gap-4">

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
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
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
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
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                                        />
                                    </div>

                                </div>

                            </div>

                            {/* Buttons */}
                            <div className="mt-6 flex justify-end gap-3">

                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleCreateTask}
                                    disabled={creatingTask}
                                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {creatingTask ? "Creating..." : "Create Task"}
                                </button>

                            </div>

                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default Dashboard;