import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    FolderKanban,
    MoreHorizontal,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import AppLayout from "../components/AppLayout";

const Projects = () => {
    const navigate = useNavigate();

    const { activeWorkspace, loading: workspaceLoading } = useWorkspace();
    const { isOwner } = useWorkspace();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creatingProject, setCreatingProject] = useState(false);
    const [createError, setCreateError] = useState("");
    const [newProject, setNewProject] = useState({
        name: "",
        description: "",
    });

    const [openMenu, setOpenMenu] = useState(null);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [editProject, setEditProject] = useState({
        name: "",
        description: "",
    });
    const [updatingProject, setUpdatingProject] = useState(false);
    const [editError, setEditError] = useState("");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingProject, setDeletingProject] = useState(null);
    const [deletingProjectLoading, setDeletingProjectLoading] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const workspaceId = activeWorkspace?._id;

    const fetchProjects = async () => {
        if (!workspaceId) return;
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/workspaces/${workspaceId}/projects`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch projects"
                );
            }

            setProjects(data.projects || []);
        } catch (error) {
            console.error("Fetch projects error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!workspaceId) return;

        fetchProjects();
    }, [workspaceId]);

    useEffect(() => {
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

    }, []);

    const openEditModal = (project) => {
        setEditingProject(project);

        setEditProject({
            name: project.name || "",
            description: project.description || "",
        });

        setEditError("");
        setShowEditModal(true);
    };

    const openDeleteModal = (project) => {
        setDeletingProject(project);
        setDeleteError("");
        setShowDeleteModal(true);
    };

    const handleCreateProject = async () => {
        try {
            setCreateError("");

            if (!newProject.name.trim()) {
                setCreateError("Project name is required");
                return;
            }

            setCreatingProject(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/workspaces/${workspaceId}/projects`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: newProject.name,
                        description: newProject.description,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to create project"
                );
            }

            setShowCreateModal(false);

            setNewProject({
                name: "",
                description: "",
            });

            await fetchProjects();
        } catch (error) {
            console.error("Create project error:", error);
            setCreateError(error.message);
        } finally {
            setCreatingProject(false);
        }
    };

    const handleUpdateProject = async () => {
        try {
            setEditError("");

            if (!editProject.name.trim()) {
                setEditError("Project name is required");
                return;
            }

            setUpdatingProject(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/projects/${editingProject._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: editProject.name,
                        description: editProject.description,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update project"
                );
            }

            setShowEditModal(false);
            setEditingProject(null);

            await fetchProjects();
        } catch (error) {
            console.error("Update project error:", error);
            setEditError(error.message);
        } finally {
            setUpdatingProject(false);
        }
    };

    const handleDeleteProject = async () => {
        try {
            setDeleteError("");
            setDeletingProjectLoading(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/projects/${deletingProject._id}`,
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
                    data.message || "Failed to delete project"
                );
            }

            setShowDeleteModal(false);
            setDeletingProject(null);

            await fetchProjects();
        } catch (error) {
            console.error("Delete project error:", error);
            setDeleteError(error.message);
        } finally {
            setDeletingProjectLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="min-h-screen p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">

                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Projects
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Manage and organize your workspace projects.
                            </p>
                        </div>

                        {isOwner && (
                            <button
                                onClick={() => {
                                    setCreateError("");
                                    setShowCreateModal(true);
                                }}
                                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">
                                <Plus size={18} />
                                New Project
                            </button>
                        )}
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                            <p className="text-sm text-slate-500">
                                Loading projects...
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Projects */}
                    {!loading && !error && (
                        <>
                            {projects.length > 0 ? (
                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                    {projects.map((project) => (
                                        <div
                                            key={project._id}
                                            onClick={() => navigate(`/projects/${project._id}`)}
                                            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                                    <FolderKanban size={21} />
                                                </div>

                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();

                                                            setOpenMenu(
                                                                openMenu === project._id
                                                                    ? null
                                                                    : project._id
                                                            );
                                                        }}
                                                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                                    >
                                                        <MoreHorizontal size={19} />
                                                    </button>

                                                    {openMenu === project._id && (
                                                        <div
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="absolute right-0 top-10 z-30 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
                                                        >
                                                            <button
                                                                onClick={() => {
                                                                    openEditModal(project);
                                                                    setOpenMenu(null);
                                                                }}
                                                                className="flex w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                                                            >
                                                                Edit Project
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    openDeleteModal(project);
                                                                    setOpenMenu(null);
                                                                }}
                                                                className="flex w-full px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                                                            >
                                                                Delete Project
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <h2 className="mt-5 text-lg font-semibold text-slate-900">
                                                {project.name}
                                            </h2>

                                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                                                {project.description ||
                                                    "No description provided."}
                                            </p>

                                            <div className="mt-5 border-t border-slate-100 pt-4">
                                                <p className="text-xs text-slate-400">
                                                    Created by
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-slate-700">
                                                    {project.createdBy?.name ||
                                                        "Unknown"}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
                                    <FolderKanban
                                        className="mx-auto text-slate-400"
                                        size={40}
                                    />

                                    <h2 className="mt-4 font-semibold text-slate-800">
                                        No projects yet
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Create your first project to get started.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

                            <h2 className="text-xl font-semibold text-slate-900">
                                Create New Project
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Add a new project to your workspace.
                            </p>

                            {createError && (
                                <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                                    {createError}
                                </div>
                            )}

                            {/* Project Name */}
                            <div className="mt-5">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Project Name
                                </label>

                                <input
                                    type="text"
                                    value={newProject.name}
                                    onChange={(e) =>
                                        setNewProject({
                                            ...newProject,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. TaskFlow Website"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            {/* Description */}
                            <div className="mt-4">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    rows="4"
                                    value={newProject.description}
                                    onChange={(e) =>
                                        setNewProject({
                                            ...newProject,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Describe your project..."
                                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setCreateError("");
                                    }}
                                    disabled={creatingProject}
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleCreateProject}
                                    disabled={creatingProject}
                                    className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {creatingProject
                                        ? "Creating..."
                                        : "Create Project"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showEditModal && editingProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

                            <h2 className="text-xl font-semibold text-slate-900">
                                Edit Project
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Update your project information.
                            </p>

                            {editError && (
                                <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                                    {editError}
                                </div>
                            )}

                            {/* Name */}
                            <div className="mt-5">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Project Name
                                </label>

                                <input
                                    type="text"
                                    value={editProject.name}
                                    onChange={(e) =>
                                        setEditProject({
                                            ...editProject,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            {/* Description */}
                            <div className="mt-4">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    rows="4"
                                    value={editProject.description}
                                    onChange={(e) =>
                                        setEditProject({
                                            ...editProject,
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingProject(null);
                                    }}
                                    disabled={updatingProject}
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleUpdateProject}
                                    disabled={updatingProject}
                                    className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {updatingProject
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showDeleteModal && deletingProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

                            <h2 className="text-xl font-semibold text-slate-900">
                                Delete Project?
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Are you sure you want to delete{" "}
                                <span className="font-medium text-slate-700">
                                    "{deletingProject.name}"
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
                                        setDeletingProject(null);
                                    }}
                                    disabled={deletingProjectLoading}
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleDeleteProject}
                                    disabled={deletingProjectLoading}
                                    className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                                >
                                    {deletingProjectLoading
                                        ? "Deleting..."
                                        : "Delete Project"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default Projects;