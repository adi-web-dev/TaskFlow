import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();

  const [workspaces, setWorkspaces] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isMember, setIsMember] = useState(false);

  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);


  const fetchWorkspaces = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setWorkspaces([]);
        setActiveWorkspace(null);
        setIsOwner(false);
        setIsMember(false);
        localStorage.removeItem("activeWorkspaceId");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/workspaces",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch workspaces");
      }

      const workspaceList = data.workspaces || [];
      const savedWorkspaceId =
        localStorage.getItem("activeWorkspaceId");

      const selectedWorkspace =
        workspaceList.find(
          (workspace) => workspace._id === savedWorkspaceId
        ) || workspaceList[0] || null;

      setWorkspaces(workspaceList);
      setActiveWorkspace(selectedWorkspace);

      if (selectedWorkspace) {
        localStorage.setItem(
          "activeWorkspaceId",
          selectedWorkspace._id
        );
      } else {
        localStorage.removeItem("activeWorkspaceId");
      }
    } catch (error) {
      console.error("Fetch workspaces error:", error);
      setWorkspaces([]);
      setActiveWorkspace(null);
      setIsOwner(false);
      setIsMember(false);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setIsOwner(false);
      setIsMember(false);
      setLoading(false);
      localStorage.removeItem("activeWorkspaceId");
      return;
    }

    fetchWorkspaces();
  }, [user, authLoading]);



  useEffect(() => {
    if (!activeWorkspace || !user?._id) {
      setIsOwner(false);
      setIsMember(false);
      return;
    }

    const ownerId =
      activeWorkspace.owner?._id || activeWorkspace.owner;

    const memberIds =
      activeWorkspace.members?.map(
        (member) => member.user?._id || member.user || member._id
      ) || [];

    setIsOwner(String(ownerId) === String(user._id));
    setIsMember(
      memberIds.some((id) => String(id) === String(user._id))
    );
  }, [activeWorkspace, user]);


  const changeWorkspace = (workspace) => {
    setActiveWorkspace(workspace);

    localStorage.setItem(
      "activeWorkspaceId",
      workspace._id
    );
  };

  const createWorkspace = async (name, description) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:5000/api/workspaces",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create workspace");
    }

    await fetchWorkspaces();

    return data;
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        isOwner,
        isMember,
        loading,
        changeWorkspace,
        createWorkspace,
        refreshWorkspaces: fetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  return useContext(WorkspaceContext);
};