import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Sparkles,
    RefreshCw,
    Brain,
    AlertTriangle,
    Target,
    Lightbulb,
    ArrowRight,
    CalendarDays,
} from "lucide-react";
import AppLayout from "../components/AppLayout";

const AIProductivity = () => {
    const navigate = useNavigate();

    const [lastAnalyzed, setLastAnalyzed] = useState(null);
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [taskPriorities, setTaskPriorities] = useState(null);
    const [priorityLoading, setPriorityLoading] = useState(false);
    const [priorityError, setPriorityError] = useState("");

    const getInsights = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/ai/productivity",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to generate insights"
                );
            }

            if (!data.insights) {
                throw new Error("AI returned an invalid response");
            }

            setInsights(data.insights);
            setLastAnalyzed(new Date());
            console.log("AI insights received:", data.insights);
            console.log("Last analyzed at:", new Date().toLocaleTimeString());
        } catch (error) {
            console.error("AI insights error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getTaskPriorities = async () => {
        try {
            setPriorityLoading(true);
            setPriorityError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/ai/task-priorities",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to generate task priorities"
                );
            }

            setTaskPriorities(data);
        } catch (error) {
            console.error(
                "AI task prioritization error:",
                error
            );

            setPriorityError(error.message);
        } finally {
            setPriorityLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="p-8 max-w-6xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                                <Sparkles size={24} />
                            </div>

                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">
                                    AI Productivity
                                </h1>

                                <p className="text-slate-500 mt-1">
                                    Get personalized insights from your TaskFlow activity
                                </p>
                                {lastAnalyzed && (
                                    <p className="text-xs text-slate-400 mt-1">
                                        Last analyzed:{" "}
                                        {lastAnalyzed.toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={getInsights}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition disabled:opacity-50"
                    >
                        <RefreshCw
                            size={18}
                            className={loading ? "animate-spin" : ""}
                        />

                        {loading
                            ? "Analyzing..."
                            : insights
                                ? "Refresh Analysis"
                                : "Generate Insights"}
                    </button>
                </div>

                {/* Intro */}
                {!insights && !loading && !error && (
                    <div className="bg-linear-to-br from-violet-600 to-indigo-600 text-white rounded-3xl p-10 mb-8">
                        <div className="max-w-2xl">
                            <Sparkles size={32} className="mb-5" />

                            <h2 className="text-2xl font-bold mb-3">
                                Your personal productivity assistant
                            </h2>

                            <p className="text-violet-100 leading-7 mb-6">
                                Gemini will analyze your current tasks, priorities,
                                deadlines and progress to give you practical
                                recommendations.
                            </p>

                            <button
                                onClick={getInsights}
                                className="px-5 py-3 bg-white text-violet-700 rounded-xl font-semibold hover:bg-violet-50 transition"
                            >
                                Analyze My Tasks
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="grid gap-5">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse"
                            >
                                <div className="flex gap-3 mb-5">
                                    <div className="w-10 h-10 bg-slate-200 rounded-xl" />

                                    <div className="h-5 bg-slate-200 rounded w-48" />
                                </div>

                                <div className="space-y-3">
                                    <div className="h-4 bg-slate-200 rounded w-full" />
                                    <div className="h-4 bg-slate-200 rounded w-5/6" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5">
                        <p className="font-medium">
                            Unable to generate insights
                        </p>

                        <p className="text-sm mt-1">
                            {error}
                        </p>

                        <button
                            onClick={getInsights}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* AI Results */}
                {insights && !loading && (
                    <div className="grid gap-5">

                        {/* Workload */}



                        {/* Workload Summary */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                                    <Brain size={20} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Workload Summary
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        Overview of your current tasks
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* Total */}
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-sm text-slate-500">
                                        Total Tasks
                                    </p>

                                    <p className="text-2xl font-bold text-slate-900 mt-1">
                                        {insights.workloadSummary.total}
                                    </p>
                                </div>

                                {/* Completed */}
                                <div className="bg-green-50 rounded-xl p-4">
                                    <p className="text-sm text-green-700">
                                        Completed
                                    </p>

                                    <p className="text-2xl font-bold text-green-700 mt-1">
                                        {insights.workloadSummary.completed}
                                    </p>
                                </div>

                                {/* In Progress */}
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <p className="text-sm text-blue-700">
                                        In Progress
                                    </p>

                                    <p className="text-2xl font-bold text-blue-700 mt-1">
                                        {insights.workloadSummary.inProgress}
                                    </p>
                                </div>

                                {/* Todo */}
                                <div className="bg-amber-50 rounded-xl p-4">
                                    <p className="text-sm text-amber-700">
                                        To Do
                                    </p>

                                    <p className="text-2xl font-bold text-amber-700 mt-1">
                                        {insights.workloadSummary.todo}
                                    </p>
                                </div>
                            </div>

                            {/* Additional metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

                                {/* Completion Rate */}
                                <div className="border border-slate-200 rounded-xl p-4">
                                    <p className="text-sm text-slate-500">
                                        Completion Rate
                                    </p>

                                    <div className="flex items-end gap-2 mt-1">
                                        <p className="text-2xl font-bold text-slate-900">
                                            {insights.workloadSummary.completionRate}%
                                        </p>
                                    </div>

                                    <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full transition-all"
                                            style={{
                                                width: `${insights.workloadSummary.completionRate}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Overdue */}
                                <div className="border border-slate-200 rounded-xl p-4">
                                    <p className="text-sm text-slate-500">
                                        Overdue
                                    </p>

                                    <p className="text-2xl font-bold text-red-600 mt-1">
                                        {insights.workloadSummary.overdue}
                                    </p>

                                    <p className="text-xs text-slate-500 mt-1">
                                        Incomplete tasks past their deadline
                                    </p>
                                </div>

                                {/* High Priority */}
                                <div className="border border-slate-200 rounded-xl p-4">
                                    <p className="text-sm text-slate-500">
                                        High Priority
                                    </p>

                                    <p className="text-2xl font-bold text-orange-600 mt-1">
                                        {insights.workloadSummary.highPriorityIncomplete}
                                    </p>

                                    <p className="text-xs text-slate-500 mt-1">
                                        High priority incomplete tasks
                                    </p>
                                </div>
                            </div>
                        </div>


                        {/* Attention */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                                    <AlertTriangle size={20} />
                                </div>

                                <h2 className="text-lg font-semibold text-slate-900">
                                    Attention Needed
                                </h2>
                            </div>

                            {insights.attentionNeeded?.length > 0 ? (
                                <ul className="space-y-3">
                                    {insights.attentionNeeded.map((item) => (
                                        <li
                                            key={item.taskId}
                                            className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50/30 transition"
                                        >
                                            <div className="flex gap-3">
                                                <span className="mt-2 w-2 h-2 rounded-full bg-red-500 shrink-0" />

                                                <div>
                                                    <p className="font-medium text-slate-800">
                                                        {item.title}
                                                    </p>

                                                    <p className="text-sm text-slate-500 mt-1">
                                                        {item.reason}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => navigate(`/tasks/${item.taskId}`)}
                                                className="shrink-0 text-sm font-medium text-violet-600 hover:text-violet-700"
                                            >
                                                View Task
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-500">
                                    No urgent tasks require attention.
                                </p>
                            )}
                        </div>

                        {/* Focus */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <Target size={20} />
                                </div>

                                <h2 className="text-lg font-semibold text-slate-900">
                                    Focus Recommendation
                                </h2>
                            </div>

                            <p className="text-slate-600 leading-7">
                                {insights.focusRecommendation}
                            </p>
                        </div>

                        {/* Tip */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                                    <Lightbulb size={20} />
                                </div>

                                <h2 className="text-lg font-semibold text-slate-900">
                                    Productivity Tip
                                </h2>
                            </div>

                            <p className="text-slate-600 leading-7">
                                {insights.productivityTip}
                            </p>
                        </div>

                        {/* AI Task Prioritization */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6">

                            <div className="flex items-center justify-between gap-4 mb-6">

                                <div className="flex items-center gap-3">

                                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                        <Target size={20} />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">
                                            AI Task Prioritization
                                        </h2>

                                        <p className="text-sm text-slate-500">
                                            Find out what you should work on first
                                        </p>
                                    </div>

                                </div>

                                <button
                                    onClick={getTaskPriorities}
                                    disabled={priorityLoading}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition disabled:opacity-50"
                                >
                                    <RefreshCw
                                        size={16}
                                        className={
                                            priorityLoading
                                                ? "animate-spin"
                                                : ""
                                        }
                                    />

                                    {priorityLoading
                                        ? "Analyzing..."
                                        : taskPriorities
                                            ? "Refresh"
                                            : "Prioritize Tasks"}
                                </button>

                            </div>

                            {/* Error */}
                            {priorityError && !priorityLoading && (
                                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">

                                    <p className="text-sm font-medium">
                                        Unable to prioritize tasks
                                    </p>

                                    <p className="text-sm mt-1">
                                        {priorityError}
                                    </p>

                                </div>
                            )}

                            {/* Initial state */}
                            {!taskPriorities &&
                                !priorityLoading &&
                                !priorityError && (
                                    <div className="bg-orange-50 rounded-xl p-5">

                                        <p className="text-sm text-orange-800 leading-6">
                                            AI will analyze your incomplete tasks,
                                            deadlines, priorities and current progress
                                            to recommend the order in which you should
                                            work on them.
                                        </p>

                                    </div>
                                )}

                            {/* Loading */}
                            {priorityLoading && (
                                <div className="space-y-3">

                                    {[1, 2, 3].map((item) => (
                                        <div
                                            key={item}
                                            className="h-20 bg-slate-100 rounded-xl animate-pulse"
                                        />
                                    ))}

                                </div>
                            )}

                            {/* Results */}
                            {taskPriorities &&
                                !priorityLoading && (
                                    <div className="space-y-5">

                                        {/* Focus First */}
                                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl p-5">

                                            <div className="flex items-center gap-2 mb-2">

                                                <Target size={18} />

                                                <span className="text-sm font-medium text-orange-100">
                                                    Focus First
                                                </span>

                                            </div>

                                            <h3 className="text-xl font-bold">
                                                {taskPriorities.focusTask ||
                                                    "No task selected"}
                                            </h3>

                                            <p className="text-sm text-orange-100 mt-2 leading-6">
                                                {taskPriorities.summary}
                                            </p>

                                        </div>

                                        {/* Recommended Tasks */}
                                        <div className="space-y-3">

                                            {taskPriorities.priorities?.map(
                                                (task) => (
                                                    <div
                                                        key={task.taskId}
                                                        className="border border-slate-200 rounded-xl p-4 hover:border-orange-200 transition"
                                                    >

                                                        <div className="flex items-start gap-4">

                                                            {/* Rank */}
                                                            <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold shrink-0">
                                                                {task.rank}
                                                            </div>

                                                            <div className="flex-1 min-w-0">

                                                                <div className="flex flex-wrap items-center gap-2">

                                                                    <h3 className="font-medium text-slate-900">
                                                                        {task.title}
                                                                    </h3>

                                                                    <span
                                                                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${task.priority ===
                                                                            "high"
                                                                            ? "bg-red-100 text-red-700"
                                                                            : task.priority ===
                                                                                "medium"
                                                                                ? "bg-amber-100 text-amber-700"
                                                                                : "bg-green-100 text-green-700"
                                                                            }`}
                                                                    >
                                                                        {task.priority}
                                                                    </span>

                                                                </div>

                                                                <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">

                                                                    <span>
                                                                        {task.status ===
                                                                            "in-progress"
                                                                            ? "In Progress"
                                                                            : task.status ===
                                                                                "todo"
                                                                                ? "To Do"
                                                                                : task.status}
                                                                    </span>

                                                                    <span className="flex items-center gap-1">

                                                                        <CalendarDays
                                                                            size={13}
                                                                        />

                                                                        {task.dueDate ||
                                                                            "No due date"}

                                                                    </span>

                                                                </div>

                                                                <p className="text-sm text-slate-500 mt-3 leading-5">
                                                                    {task.reason}
                                                                </p>

                                                                <p className="text-sm text-slate-700 mt-2">
                                                                    <span className="font-medium">
                                                                        Recommendation:
                                                                    </span>{" "}
                                                                    {task.recommendation}
                                                                </p>

                                                            </div>

                                                            <button
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/tasks/${task.taskId}`
                                                                    )
                                                                }
                                                                className="flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 shrink-0"
                                                            >
                                                                View
                                                                <ArrowRight
                                                                    size={15}
                                                                />
                                                            </button>

                                                        </div>

                                                    </div>
                                                )
                                            )}

                                        </div>

                                    </div>
                                )}

                        </div>

                    </div>
                )}

            </div>
        </AppLayout>
    );
};



export default AIProductivity;