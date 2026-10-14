import { useEffect, useState } from "react";
import {
    Users,
    UserPlus,
    Trash2,
    Mail,
    Crown,
    ClipboardList,
    Clock3,
    CircleCheck,
    AlertCircle,
    Sparkles,
    RefreshCw,
    CheckCircle2,
    AlertTriangle,
    Activity,
} from "lucide-react";
import AppLayout from "../components/AppLayout";
import { useWorkspace } from "../context/WorkspaceContext";


const Members = () => {
    const { activeWorkspace, loading: workspaceLoading } = useWorkspace();

    const [workload, setWorkload] = useState([]);
    const [workloadLoading, setWorkloadLoading] = useState(false);

    const { isOwner } = useWorkspace();

    const [members, setMembers] = useState([]);
    const [owner, setOwner] = useState(null);
    const [loading, setLoading] = useState(true);

    const [memberDetails, setMemberDetails] = useState(null);
    const [memberDetailsLoading, setMemberDetailsLoading] = useState(false);


    const [showAddModal, setShowAddModal] = useState(false);
    const [newMemberId, setNewMemberId] = useState("");

    const [memberToRemove, setMemberToRemove] = useState(null);
    const [removingMember, setRemovingMember] = useState(false);

    const workspaceId = activeWorkspace?._id;

    const [selectedMember, setSelectedMember] = useState(null);

    const [aiPerformance, setAiPerformance] = useState(null);
    const [aiPerformanceLoading, setAiPerformanceLoading] = useState(false);
    const [aiPerformanceError, setAiPerformanceError] = useState("");

    const handleMemberDetails = async (userId) => {
        try {
            setMemberDetailsLoading(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/workspaces/${activeWorkspace._id}/members/${userId}/details`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch member details"
                );
            }

            setMemberDetails(data);
            setSelectedMember(userId);


            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } catch (error) {
            console.error("Fetch member details error:", error);
        } finally {
            setMemberDetailsLoading(false);
        }
    };
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

            setOwner(data.owner);
            setMembers(data.members);
        } catch (error) {
            console.error("Get members error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamWorkload = async () => {
        if (!activeWorkspace?._id) return;

        try {
            setWorkloadLoading(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/workspaces/${activeWorkspace._id}/team-workload`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch workload");
            }

            setWorkload(data.workload);
        } catch (error) {
            console.error("Fetch team workload error:", error);
        } finally {
            setWorkloadLoading(false);
        }
    };

    const removeMember = async () => {
        if (!memberToRemove) return;

        try {
            setRemovingMember(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/workspaces/${workspaceId}/members/${memberToRemove.user._id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to remove member");
            }

            setMemberToRemove(null);

            await fetchMembers();
        } catch (error) {
            console.error("Remove member error:", error);
            alert(error.message);
        } finally {
            setRemovingMember(false);
        }
    };

    const fetchAIEmployeePerformance = async (userId) => {
        try {
            setAiPerformanceLoading(true);
            setAiPerformanceError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/ai/workspaces/${activeWorkspace._id}/members/${userId}/performance`,
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
                    "Failed to generate AI performance insights"
                );
            }

            setAiPerformance(data);
        } catch (error) {
            console.error(
                "AI employee performance error:",
                error
            );

            setAiPerformanceError(error.message);
        } finally {
            setAiPerformanceLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
        fetchTeamWorkload();
    }, [workspaceId]);

    return (
        <AppLayout>

            {selectedMember ? (
                <MemberDetailsView
                    memberDetails={memberDetails}
                    loading={memberDetailsLoading}
                    onBack={() => {
                        setSelectedMember(null);
                        setMemberDetails(null);
                        setAiPerformance(null);
                        setAiPerformanceError("");
                    }}
                    selectedMember={selectedMember}
                    aiPerformance={aiPerformance}
                    aiPerformanceLoading={aiPerformanceLoading}
                    aiPerformanceError={aiPerformanceError}
                    fetchAIEmployeePerformance={fetchAIEmployeePerformance}
                />
            ) : (
                // your existing Members page content

                <div className="p-8">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">
                                Members
                            </h1>

                            <p className="text-slate-500 mt-1">
                                Manage your workspace members
                            </p>
                        </div>

                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl hover:bg-slate-800 transition">
                            <UserPlus size={18} />
                            Add Member
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

                        <div className="bg-white border border-slate-200 rounded-2xl p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <Users className="text-blue-600" size={22} />
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500">
                                        Total Members
                                    </p>

                                    <p className="text-2xl font-bold text-slate-900">
                                        {members.length + (owner ? 1 : 0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <Crown className="text-purple-600" size={22} />
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500">
                                        Workspace Owner
                                    </p>

                                    <p className="text-lg font-semibold text-slate-900">
                                        {owner?.name || "—"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
                                    <Users className="text-green-600" size={22} />
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500">
                                        Team Members
                                    </p>

                                    <p className="text-2xl font-bold text-slate-900">
                                        {members.length}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Members list */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

                        <div className="px-6 py-5 border-b border-slate-200">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Workspace Members
                            </h2>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center text-slate-500">
                                Loading members...
                            </div>
                        ) : (
                            <div>

                                {/* Owner */}
                                {owner && (
                                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">

                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold">
                                                {owner.name?.charAt(0).toUpperCase()}
                                            </div>

                                            <div>
                                                <p className="font-semibold text-slate-900">
                                                    {owner.name}
                                                </p>

                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <Mail size={14} />
                                                    {owner.email}
                                                </div>
                                            </div>
                                        </div>

                                        <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-sm font-medium">
                                            <Crown size={14} />
                                            Owner
                                        </span>

                                    </div>
                                )}

                                {/* Members */}
                                {members.length === 0 ? (
                                    <div className="p-10 text-center text-slate-500">
                                        No team members yet.
                                    </div>
                                ) : (
                                    members.map((member) => (
                                        <div
                                            key={member.user._id}
                                            className="flex items-center justify-between px-6 py-5 border-b border-slate-100 last:border-b-0"
                                        >

                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                                                    {member.user.name
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        {member.user.name}
                                                    </p>

                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <Mail size={14} />
                                                        {member.user.email}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-sm capitalize">
                                                    {member.role}
                                                </span>

                                                {isOwner && (
                                                    <button
                                                        onClick={() => setMemberToRemove(member)}
                                                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                                                        title="Remove member"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>

                                        </div>
                                    ))
                                )}

                            </div>
                        )}

                    </div>
                    {showAddModal && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">

                                <div className="">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Workspace Invite Code
                                        </label>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddModal(false);
                                                setNewMemberId("");
                                            }}
                                            className="px-4  rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm font-semibold tracking-wider text-slate-800">
                                            {activeWorkspace?.inviteCode}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    activeWorkspace?.inviteCode || ""
                                                );
                                            }}
                                            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                                        >
                                            Copy
                                        </button>
                                    </div>

                                    <p className="mt-2 text-xs text-slate-500">
                                        Share this code with the person you want to add to
                                        this workspace.
                                    </p>


                                </div>

                            </div>
                        </div>
                    )}

                    {memberToRemove && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">

                                <h2 className="text-xl font-bold text-slate-900">
                                    Remove Member
                                </h2>

                                <p className="text-slate-500 mt-2">
                                    Are you sure you want to remove{" "}
                                    <span className="font-semibold text-slate-900">
                                        {memberToRemove.user.name}
                                    </span>{" "}
                                    from this workspace?
                                </p>

                                <div className="flex justify-end gap-3 mt-6">

                                    <button
                                        onClick={() => setMemberToRemove(null)}
                                        className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={removeMember}
                                        disabled={removingMember}
                                        className="px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {removingMember ? "Removing..." : "Remove"}
                                    </button>

                                </div>
                            </div>
                        </div>
                    )}

                    {isOwner && (
                        <div className="mt-8">
                            <div className="mb-5">
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Team Workload
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Click a member to view their assigned tasks and workload details.
                                </p>
                            </div>

                            {workloadLoading ? (
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                                    {[1, 2, 3].map((item) => (
                                        <div
                                            key={item}
                                            className="h-52 animate-pulse rounded-2xl bg-slate-200"
                                        />
                                    ))}
                                </div>
                            ) : workload.length === 0 ? (
                                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                                    <Users className="mx-auto mb-3 h-8 w-8 text-slate-400" />

                                    <p className="font-medium text-slate-700">
                                        No team members found
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Add members to this workspace to see their workload.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                                    {workload.map((member) => (
                                        <div
                                            key={member.user._id}
                                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                        >
                                            {/* Member Header */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">
                                                    {member.user.name
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div className="min-w-0">
                                                    <h3 className="truncate font-semibold text-slate-900">
                                                        {member.user.name}
                                                    </h3>

                                                    <p className="truncate text-sm text-slate-500">
                                                        {member.role}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Total */}
                                            <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-3">
                                                <div className="flex items-center gap-2">
                                                    <ClipboardList className="h-4 w-4 text-slate-500" />

                                                    <span className="text-sm text-slate-600">
                                                        Assigned Tasks
                                                    </span>
                                                </div>

                                                <span className="text-lg font-bold text-slate-900">
                                                    {member.total}
                                                </span>
                                            </div>

                                            {/* Stats */}
                                            <div className="mt-4 grid grid-cols-2 gap-3">
                                                <div className="rounded-xl bg-amber-50 p-3">
                                                    <p className="text-xs text-amber-600">
                                                        To Do
                                                    </p>

                                                    <p className="mt-1 text-lg font-semibold text-amber-700">
                                                        {member.todo}
                                                    </p>
                                                </div>

                                                <div className="rounded-xl bg-blue-50 p-3">
                                                    <p className="text-xs text-blue-600">
                                                        In Progress
                                                    </p>

                                                    <p className="mt-1 text-lg font-semibold text-blue-700">
                                                        {member.inProgress}
                                                    </p>
                                                </div>

                                                <div className="rounded-xl bg-emerald-50 p-3">
                                                    <p className="text-xs text-emerald-600">
                                                        Completed
                                                    </p>

                                                    <p className="mt-1 text-lg font-semibold text-emerald-700">
                                                        {member.done}
                                                    </p>
                                                </div>

                                                <div className="rounded-xl bg-red-50 p-3">
                                                    <p className="text-xs text-red-600">
                                                        Overdue
                                                    </p>

                                                    <p className="mt-1 text-lg font-semibold text-red-700">
                                                        {member.overdue}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* View Details */}
                                            <button
                                                onClick={() => handleMemberDetails(member.user._id)}
                                                className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            )}
        </AppLayout>
    );
};


const MemberDetailsView = ({
    memberDetails,
    loading,
    onBack,
    selectedMember,
    aiPerformance,
    aiPerformanceLoading,
    aiPerformanceError,
    fetchAIEmployeePerformance,
}) => {
    if (loading) {
        return (
            <div className="p-8">
                <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />

                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div
                            key={item}
                            className="h-24 animate-pulse rounded-xl bg-slate-200"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (!memberDetails) {
        return null;
    }

    const {
        user,
        role,
        summary,
        tasks,
    } = memberDetails;

    return (
        <div className="p-8">
            {/* Back */}
            <button
                onClick={onBack}
                className="mb-6 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
                ← Back to Team
            </button>

            {/* Member Header */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-600">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {user.name}
                        </h1>

                        <p className="text-sm text-slate-500">
                            {user.email}
                        </p>

                        <span className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
                            {role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Workload Summary */}
            <div className="mt-6">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">
                    Workload Overview
                </h2>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                    <SummaryCard
                        label="Total"
                        value={summary.total}
                    />

                    <SummaryCard
                        label="To Do"
                        value={summary.todo}
                    />

                    <SummaryCard
                        label="In Progress"
                        value={summary.inProgress}
                    />

                    <SummaryCard
                        label="Completed"
                        value={summary.done}
                    />

                    <SummaryCard
                        label="Overdue"
                        value={summary.overdue}
                    />

                    <SummaryCard
                        label="High Priority"
                        value={summary.highPriority}
                    />
                </div>
            </div>

            {/* Assigned Tasks */}
            <div className="mt-8">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Assigned Tasks
                    </h2>

                    <p className="text-sm text-slate-500">
                        All tasks currently assigned to {user.name}.
                    </p>
                </div>

                {tasks.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                        <p className="font-medium text-slate-700">
                            No tasks assigned
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            This member currently has no assigned tasks.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tasks.map((task) => (
                            <TaskDetailsCard
                                key={task._id}
                                task={task}
                            />
                        ))}
                    </div>
                )}
            </div>


            {/* AI Employee Performance */}
            <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6">

                <div className="flex items-center justify-between gap-4 mb-6">

                    <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                            <Sparkles size={20} />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                AI Performance Insights
                            </h2>

                            <p className="text-sm text-slate-500">
                                AI analysis based on recorded task activity
                            </p>
                        </div>

                    </div>

                    <button
                        onClick={() =>
                            fetchAIEmployeePerformance(selectedMember)
                        }
                        disabled={aiPerformanceLoading}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={
                                aiPerformanceLoading
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        {aiPerformanceLoading
                            ? "Analyzing..."
                            : aiPerformance
                                ? "Refresh Analysis"
                                : "Analyze Performance"}
                    </button>

                </div>

                {/* Initial state */}
                {!aiPerformance &&
                    !aiPerformanceLoading &&
                    !aiPerformanceError && (
                        <div className="bg-violet-50 rounded-xl p-5">

                            <p className="text-sm text-violet-800 leading-6">
                                Generate an AI analysis of this employee's
                                recorded task completion, deadlines and
                                work activity.
                            </p>

                        </div>
                    )}

                {/* Loading */}
                {aiPerformanceLoading && (
                    <div className="space-y-4">

                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="h-20 bg-slate-100 rounded-xl animate-pulse"
                            />
                        ))}

                    </div>
                )}

                {/* Error */}
                {aiPerformanceError &&
                    !aiPerformanceLoading && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">

                            <p className="font-medium text-red-700">
                                Unable to generate AI insights
                            </p>

                            <p className="text-sm text-red-600 mt-1">
                                {aiPerformanceError}
                            </p>

                        </div>
                    )}

                {/* Results */}
                {aiPerformance &&
                    !aiPerformanceLoading && (
                        <div className="space-y-6">

                            {/* Metrics */}
                            <div>

                                <h3 className="font-semibold text-slate-900 mb-3">
                                    Performance Metrics
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-xs text-slate-500">
                                            Assigned
                                        </p>

                                        <p className="text-2xl font-bold text-slate-900 mt-1">
                                            {
                                                aiPerformance.metrics
                                                    .totalAssigned
                                            }
                                        </p>
                                    </div>

                                    <div className="bg-green-50 rounded-xl p-4">
                                        <p className="text-xs text-green-700">
                                            Completed
                                        </p>

                                        <p className="text-2xl font-bold text-green-700 mt-1">
                                            {
                                                aiPerformance.metrics
                                                    .completed
                                            }
                                        </p>
                                    </div>

                                    <div className="bg-blue-50 rounded-xl p-4">
                                        <p className="text-xs text-blue-700">
                                            In Progress
                                        </p>

                                        <p className="text-2xl font-bold text-blue-700 mt-1">
                                            {
                                                aiPerformance.metrics
                                                    .inProgress
                                            }
                                        </p>
                                    </div>

                                    <div className="bg-red-50 rounded-xl p-4">
                                        <p className="text-xs text-red-700">
                                            Overdue
                                        </p>

                                        <p className="text-2xl font-bold text-red-700 mt-1">
                                            {
                                                aiPerformance.metrics
                                                    .overdue
                                            }
                                        </p>
                                    </div>

                                </div>

                            </div>

                            {/* Rates */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                <div className="border border-slate-200 rounded-xl p-4">

                                    <p className="text-sm text-slate-500">
                                        Completion Rate
                                    </p>

                                    <p className="text-2xl font-bold text-slate-900 mt-1">
                                        {
                                            aiPerformance.metrics
                                                .completionRate
                                        }%
                                    </p>

                                    <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">

                                        <div
                                            className="h-full bg-green-500 rounded-full"
                                            style={{
                                                width: `${Math.min(
                                                    aiPerformance.metrics
                                                        .completionRate,
                                                    100
                                                )}%`,
                                            }}
                                        />

                                    </div>

                                </div>

                                <div className="border border-slate-200 rounded-xl p-4">

                                    <p className="text-sm text-slate-500">
                                        On-time Completion
                                    </p>

                                    <p className="text-2xl font-bold text-slate-900 mt-1">
                                        {
                                            aiPerformance.metrics
                                                .onTimeCompletionRate
                                        }%
                                    </p>

                                </div>

                                <div className="border border-slate-200 rounded-xl p-4">

                                    <p className="text-sm text-slate-500">
                                        Avg. Completion Time
                                    </p>

                                    <p className="text-2xl font-bold text-slate-900 mt-1">
                                        {
                                            aiPerformance.metrics
                                                .averageCompletionTime
                                        } days
                                    </p>

                                </div>

                            </div>

                            {/* AI Overview */}
                            <div className="bg-violet-50 rounded-xl p-5">

                                <div className="flex items-center gap-2 mb-2">

                                    <Sparkles
                                        size={17}
                                        className="text-violet-600"
                                    />

                                    <h3 className="font-semibold text-violet-900">
                                        AI Overview
                                    </h3>

                                </div>

                                <p className="text-sm text-violet-800 leading-6">
                                    {aiPerformance.insights.overview}
                                </p>

                            </div>

                            {/* AI Insights */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div className="border border-slate-200 rounded-xl p-5">

                                    <div className="flex items-center gap-2 mb-3">

                                        <CheckCircle2
                                            size={18}
                                            className="text-green-600"
                                        />

                                        <h3 className="font-semibold text-slate-900">
                                            Completion
                                        </h3>

                                    </div>

                                    <p className="text-sm text-slate-600 leading-6">
                                        {
                                            aiPerformance.insights
                                                .completionInsight
                                        }
                                    </p>

                                </div>

                                <div className="border border-slate-200 rounded-xl p-5">

                                    <div className="flex items-center gap-2 mb-3">

                                        <Clock3
                                            size={18}
                                            className="text-blue-600"
                                        />

                                        <h3 className="font-semibold text-slate-900">
                                            Deadline Pattern
                                        </h3>

                                    </div>

                                    <p className="text-sm text-slate-600 leading-6">
                                        {
                                            aiPerformance.insights
                                                .deadlineInsight
                                        }
                                    </p>

                                </div>

                                <div className="border border-slate-200 rounded-xl p-5">

                                    <div className="flex items-center gap-2 mb-3">

                                        <Activity
                                            size={18}
                                            className="text-violet-600"
                                        />

                                        <h3 className="font-semibold text-slate-900">
                                            Work Pattern
                                        </h3>

                                    </div>

                                    <p className="text-sm text-slate-600 leading-6">
                                        {
                                            aiPerformance.insights
                                                .workPatternInsight
                                        }
                                    </p>

                                </div>

                                <div className="border border-slate-200 rounded-xl p-5">

                                    <div className="flex items-center gap-2 mb-3">

                                        <AlertTriangle
                                            size={18}
                                            className="text-orange-600"
                                        />

                                        <h3 className="font-semibold text-slate-900">
                                            Attention Areas
                                        </h3>

                                    </div>

                                    {aiPerformance.insights
                                        .attentionAreas?.length > 0 ? (
                                        <ul className="space-y-2">

                                            {aiPerformance.insights.attentionAreas.map(
                                                (item, index) => (
                                                    <li
                                                        key={index}
                                                        className="text-sm text-slate-600 flex gap-2"
                                                    >
                                                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />

                                                        <span>
                                                            {item}
                                                        </span>
                                                    </li>
                                                )
                                            )}

                                        </ul>
                                    ) : (
                                        <p className="text-sm text-slate-500">
                                            No specific attention areas identified.
                                        </p>
                                    )}

                                </div>

                            </div>

                            {/* Positive Observations */}
                            {aiPerformance.insights
                                .positiveObservations?.length > 0 && (
                                    <div className="border border-green-200 bg-green-50 rounded-xl p-5">

                                        <h3 className="font-semibold text-green-900 mb-3">
                                            Positive Observations
                                        </h3>

                                        <ul className="space-y-2">

                                            {aiPerformance.insights.positiveObservations.map(
                                                (item, index) => (
                                                    <li
                                                        key={index}
                                                        className="text-sm text-green-800 flex gap-2"
                                                    >
                                                        <span>✓</span>

                                                        <span>
                                                            {item}
                                                        </span>
                                                    </li>
                                                )
                                            )}

                                        </ul>

                                    </div>
                                )}

                            {/* Recommendations */}
                            {aiPerformance.insights
                                .recommendations?.length > 0 && (
                                    <div className="border border-blue-200 bg-blue-50 rounded-xl p-5">

                                        <h3 className="font-semibold text-blue-900 mb-3">
                                            Suggested Actions
                                        </h3>

                                        <ul className="space-y-2">

                                            {aiPerformance.insights.recommendations.map(
                                                (item, index) => (
                                                    <li
                                                        key={index}
                                                        className="text-sm text-blue-800 flex gap-2"
                                                    >
                                                        <span>
                                                            {index + 1}.
                                                        </span>

                                                        <span>
                                                            {item}
                                                        </span>
                                                    </li>
                                                )
                                            )}

                                        </ul>

                                    </div>
                                )}

                        </div>
                    )}

            </div>
        </div>
    );
};

const SummaryCard = ({ label, value }) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">
                {label}
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
                {value}
            </p>
        </div>
    );
};

const TaskDetailsCard = ({ task }) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900">
                        {task.title}
                    </h3>

                    {task.description && (
                        <p className="mt-1 text-sm text-slate-500">
                            {task.description}
                        </p>
                    )}

                    {task.project && (
                        <p className="mt-3 text-xs text-slate-500">
                            Project:{" "}
                            <span className="font-medium text-slate-700">
                                {task.project.name}
                            </span>
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
                        {task.status.replace("-", " ")}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
                        {task.priority}
                    </span>
                </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
                <div className="flex flex-wrap gap-5 text-sm text-slate-500">
                    <span>
                        Due:{" "}
                        <span className="font-medium text-slate-700">
                            {task.dueDate
                                ? new Date(
                                    task.dueDate
                                ).toLocaleDateString()
                                : "No due date"}
                        </span>
                    </span>

                    <span>
                        Created:{" "}
                        <span className="font-medium text-slate-700">
                            {new Date(
                                task.createdAt
                            ).toLocaleDateString()}
                        </span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Members;