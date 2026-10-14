import { useEffect, useMemo, useState } from "react";
import {
    Search,
    SlidersHorizontal,
    ClipboardList,
    CalendarDays,
    User,
    FolderKanban,
} from "lucide-react";
import AppLayout from "../components/AppLayout";
import { useWorkspace } from "../context/WorkspaceContext";

const TeamTasks = () => {
    const { activeWorkspace, loading: workspaceLoading } = useWorkspace();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [memberFilter, setMemberFilter] = useState("all");

    const workspaceId = activeWorkspace?._id;

    useEffect(() => {
        if (!workspaceId) return;

        fetchTeamTasks();
    }, [workspaceId]);

    const fetchTeamTasks = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/workspaces/${workspaceId}/team-tasks`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch team tasks"
                );
            }

            setTasks(data.tasks || []);
        } catch (error) {
            console.error("Fetch team tasks error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Unique members for member filter
    const members = useMemo(() => {
        const memberMap = new Map();

        tasks.forEach((task) => {
            if (task.assignedTo) {
                memberMap.set(
                    task.assignedTo._id,
                    task.assignedTo
                );
            }
        });

        return Array.from(memberMap.values());
    }, [tasks]);

    // Filter tasks
    const filteredTasks = useMemo(() => {
        const searchValue = search.toLowerCase().trim();

        return tasks.filter((task) => {
            const matchesSearch =
                !searchValue ||
                task.title?.toLowerCase().includes(searchValue) ||
                task.description
                    ?.toLowerCase()
                    .includes(searchValue) ||
                task.project?.name
                    ?.toLowerCase()
                    .includes(searchValue) ||
                task.assignedTo?.name
                    ?.toLowerCase()
                    .includes(searchValue);

            const matchesStatus =
                statusFilter === "all" ||
                task.status === statusFilter;

            const matchesPriority =
                priorityFilter === "all" ||
                task.priority === priorityFilter;

            const matchesMember =
                memberFilter === "all" ||
                task.assignedTo?._id === memberFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority &&
                matchesMember
            );
        });
    }, [
        tasks,
        search,
        statusFilter,
        priorityFilter,
        memberFilter,
    ]);

    if (workspaceLoading) {
        return (
            <AppLayout>
                <div className="p-8">
                    Loading workspace...
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100">
                            <ClipboardList className="h-5 w-5 text-indigo-600" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Team Tasks
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                View and track all tasks across this workspace.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-indigo-500"
                            />
                        </div>

                        {/* Status */}
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                        >
                            <option value="all">
                                All Status
                            </option>
                            <option value="todo">
                                To Do
                            </option>
                            <option value="in-progress">
                                In Progress
                            </option>
                            <option value="done">
                                Completed
                            </option>
                        </select>

                        {/* Priority */}
                        <select
                            value={priorityFilter}
                            onChange={(e) =>
                                setPriorityFilter(e.target.value)
                            }
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                        >
                            <option value="all">
                                All Priority
                            </option>
                            <option value="low">Low</option>
                            <option value="medium">
                                Medium
                            </option>
                            <option value="high">High</option>
                        </select>

                        {/* Member */}
                        <select
                            value={memberFilter}
                            onChange={(e) =>
                                setMemberFilter(e.target.value)
                            }
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                        >
                            <option value="all">
                                All Members
                            </option>

                            {members.map((member) => (
                                <option
                                    key={member._id}
                                    value={member._id}
                                >
                                    {member.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Result count */}
                <div className="mb-4 mt-6 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Showing{" "}
                        <span className="font-medium text-slate-700">
                            {filteredTasks.length}
                        </span>{" "}
                        task
                        {filteredTasks.length !== 1 && "s"}
                    </p>
                </div>

                {/* Tasks */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="h-40 animate-pulse rounded-2xl bg-slate-200"
                            />
                        ))}
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                        <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />

                        <h3 className="mt-4 font-semibold text-slate-800">
                            No tasks found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Try changing your search or filters.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTasks.map((task) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

const TaskCard = ({ task }) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                {/* Task info */}
                <div className="min-w-0">
                    <h3 className="text-base font-semibold text-slate-900">
                        {task.title}
                    </h3>

                    {task.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                            {task.description}
                        </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                            <FolderKanban className="h-4 w-4" />

                            {task.project?.name ||
                                "No project"}
                        </span>

                        <span className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />

                            {task.assignedTo?.name ||
                                "Unassigned"}
                        </span>

                        <span className="flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4" />

                            {task.dueDate
                                ? new Date(
                                      task.dueDate
                                  ).toLocaleDateString()
                                : "No due date"}
                        </span>
                    </div>
                </div>

                {/* Status / Priority */}
                <div className="flex shrink-0 flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
                        {task.status.replace(
                            "-",
                            " "
                        )}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
                        {task.priority}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TeamTasks;