import {
    LayoutDashboard,
    ListTodo,
    CheckSquare,
    ChevronDown,
    FolderKanban,
    Users,
    Settings,
    Sparkles,
    MoreHorizontal,
    ClipboardList,
} from "lucide-react";

import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";

import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = () => {

    const { user } = useContext(AuthContext);
    const { isOwner } = useWorkspace();


    const navigate = useNavigate();

    const menuItems = [
        {
            name: "Dashboard",
            path: "/Dashboard",
            icon: LayoutDashboard,
        },

        // Only members see My Tasks
        ...(!isOwner
            ? [
                {
                    name: "My Tasks",
                    path: "/tasks",
                    icon: ListTodo,
                },
            ]
            : []),

        {
            name: "Projects",
            path: "/projects",
            icon: FolderKanban,
        },

        {
            name: "Members",
            path: "/members",
            icon: Users,
        },

        // Only owner sees Team Tasks
        ...(isOwner
            ? [
                {
                    name: "Team Tasks",
                    path: "/team-tasks",
                    icon: ClipboardList,
                },
            ]
            : []),
    ];
    const {
        workspaces,
        activeWorkspace,
        changeWorkspace,
        createWorkspace,
    } = useWorkspace();

    const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
    const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
    const [workspaceName, setWorkspaceName] = useState("");
    const [workspaceDescription, setWorkspaceDescription] = useState("");
    const [creatingWorkspace, setCreatingWorkspace] = useState(false);

    const [joinWorkspaceOpen, setJoinWorkspaceOpen] = useState(false);
    const [inviteCode, setInviteCode] = useState("");
    const [joiningWorkspace, setJoiningWorkspace] = useState(false);

    useEffect(() => {
        const handleClickOutside = () => {
            setWorkspaceMenuOpen(false);
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener(
                "click",
                handleClickOutside
            );
        };

    }, []);

    const handleJoinWorkspace = async () => {
        try {
            setJoiningWorkspace(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/workspaces/join",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        inviteCode: inviteCode.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to join workspace"
                );
            }

            // Refresh workspaces in WorkspaceContext
            await refreshWorkspaces();

            // Make the newly joined workspace active
            changeWorkspace(data.workspace._id);

            setInviteCode("");
            setJoinWorkspaceOpen(false);
        } catch (error) {
            console.error("Join workspace error:", error);
            alert(error.message);
        } finally {
            setJoiningWorkspace(false);
        }
    };

    return (
        <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">

            {/* Logo */}
            <div className="flex h-18 items-center border-b border-slate-200 px-7">
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                        <CheckSquare size={20} strokeWidth={2.5} />
                    </div>

                    <span className="text-xl font-bold text-slate-900">
                        Task<span className="text-indigo-600">Flow</span>
                    </span>
                </div>
            </div>

            {/* Workspace */}
            <div className="px-5 pt-6">
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Workspace
                </p>

                <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">

                    <div className="relative w-full">
                        <button

                            onClick={(e) => {
                                e.stopPropagation();
                                setWorkspaceMenuOpen(!workspaceMenuOpen);

                            }}
                            className="w-full flex items-center gap-3  rounded-xl  bg-slate-50 hover:bg-slate-100 transition"
                        >
                            {/* Workspace Icon */}
                            <div className="w-10 h-10 shrink-0 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
                                {activeWorkspace?.name?.charAt(0).toUpperCase() || "W"}
                            </div>

                            {/* Workspace Name */}
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-semibold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">
                                    {activeWorkspace?.name || "No Workspace"}
                                </p>

                                <p className="text-xs text-slate-500">
                                    Workspace
                                </p>
                            </div>

                            {/* Chevron */}
                            <ChevronDown
                                className={`w-4 h-4 shrink-0 text-slate-500 transition-transform ${workspaceMenuOpen ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {workspaceMenuOpen && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2">

                                <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase">
                                    Your Workspaces
                                </p>

                                {workspaces.map((workspace) => (
                                    <button
                                        key={workspace._id}
                                        onClick={() => {
                                            changeWorkspace(workspace);
                                            setWorkspaceMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-slate-50 ${activeWorkspace?._id === workspace._id
                                            ? "bg-violet-50 text-violet-700"
                                            : "text-slate-700"
                                            }`}
                                    >
                                        <div className="w-8 h-8 shrink-0 rounded-md bg-slate-100 flex items-center justify-center text-xs font-semibold">
                                            {workspace.name?.charAt(0).toUpperCase()}
                                        </div>

                                        <span className="flex-1 min-w-0 text-sm truncate">
                                            {workspace.name}
                                        </span>
                                    </button>
                                ))}

                                <div className="border-t border-slate-100 mt-2 pt-2">
                                    <button
                                        onClick={() => {
                                            setWorkspaceMenuOpen(false);
                                            setCreateWorkspaceOpen(true);
                                        }}
                                        className="w-full px-3 py-2 text-sm text-violet-600 hover:bg-violet-50 rounded-lg text-left"
                                    >
                                        + Create Workspace
                                    </button>
                                    <button
                                        onClick={() => {
                                            setJoinWorkspaceOpen(true);
                                            setWorkspaceMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg"
                                    >
                                        <Users size={17} />
                                        Join Workspace
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Menu */}
            <nav className="mt-4 px-5 mb-2">
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Menu
                </p>

                <div className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive
                                        ? "bg-indigo-50 font-medium text-indigo-600"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`
                                }
                            >
                                <Icon size={21} />
                                {item.name}
                            </NavLink>
                        );
                    })}
                </div>
            </nav>

            {/* AI Productivity */}
            <div className="mt-auto m-3 rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 p-4 text-white">
                <div className="flex align-bottom justify-between">

                    <h3 className="font-semibold self-center">
                        AI Productivity
                    </h3>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                        <Sparkles size={19} />
                    </div>


                </div>
                <p className="mt-1 text-xs leading-5 text-indigo-100">
                    Get smart insights about your team's
                    productivity.
                </p>

                <button
                    onClick={() => navigate("/ai-productivity")}
                    className="mt-3 text-xs font-semibold">
                    Explore insights →
                </button>
            </div>

            {/* Bottom */}
            <div className="mx-4 my-1.5 pb-2">

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${isActive
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-slate-600 hover:bg-slate-50"
                        }`
                    }
                >
                    <Settings size={19} />
                    Settings
                </NavLink>

                <div className=" border-t border-slate-200 flex items-center gap-3 px-2 pt-4">

                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 truncate">
                            {user?.name || "User"}
                        </p>

                        <p className="text-xs text-slate-400">
                            Workspace {isOwner ? "Owner" : "Member"}
                        </p>
                    </div>

                    
                </div>
            </div>
            {createWorkspaceOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-100 px-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
                        <h2 className="text-xl font-bold text-slate-900">
                            Create Workspace
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            Create a new workspace for your team and projects.
                        </p>

                        <div className="mt-5">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Workspace Name
                            </label>

                            <input
                                type="text"
                                value={workspaceName}
                                onChange={(e) => setWorkspaceName(e.target.value)}
                                placeholder="e.g. My Development Team"
                                className="w-full h-11 px-4 rounded-lg border border-slate-300 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                            />
                        </div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Workspace Description
                        </label>

                        <input
                            type="text"
                            value={workspaceDescription}
                            onChange={(e) => setWorkspaceDescription(e.target.value)}
                            className="w-full h-11 px-4 rounded-lg border border-slate-300 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                        />
                        <div>

                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setCreateWorkspaceOpen(false);
                                    setWorkspaceName("");
                                    setWorkspaceDescription("");
                                }}
                                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={creatingWorkspace || !workspaceName.trim()}
                                onClick={async () => {
                                    try {
                                        setCreatingWorkspace(true);

                                        await createWorkspace(workspaceName.trim(), workspaceDescription.trim());

                                        setWorkspaceName("");
                                        setWorkspaceDescription("");
                                        setCreateWorkspaceOpen(false);
                                    } catch (error) {
                                        console.error(error);
                                        alert(error.message);
                                    } finally {
                                        setCreatingWorkspace(false);
                                    }
                                }}
                                className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
                            >
                                {creatingWorkspace
                                    ? "Creating..."
                                    : "Create Workspace"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {joinWorkspaceOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
                        <h2 className="text-xl font-bold text-slate-900">
                            Join Workspace
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            Enter the invite code shared by the workspace owner.
                        </p>

                        <div className="mt-5">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Invite Code
                            </label>

                            <input
                                type="text"
                                value={inviteCode}
                                onChange={(e) =>
                                    setInviteCode(e.target.value.toUpperCase())
                                }
                                placeholder="e.g. TF-A82F91C4"
                                className="w-full h-11 px-4 rounded-lg border border-slate-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setJoinWorkspaceOpen(false);
                                    setInviteCode("");
                                }}
                                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={
                                    joiningWorkspace ||
                                    !inviteCode.trim()
                                }
                                onClick={handleJoinWorkspace}
                                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                            >
                                {joiningWorkspace
                                    ? "Joining..."
                                    : "Join Workspace"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;