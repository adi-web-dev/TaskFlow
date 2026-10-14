import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Members from "./pages/Members";
import Settings from "./pages/Settings";
import AIProductivity from "./pages/AIProductivity";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import TeamTasks from "./pages/TeamTasks";
import TaskDetails from "./pages/TaskDetails";
import { AuthProvider } from "./context/AuthContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";

function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>

        <BrowserRouter>
          <Routes>

            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route path="/register" element={<Register />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>}
            />

            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>

              }
            />

            <Route
              path="/tasks/:taskId/details"
              element={
                <ProtectedRoute>
                  <TaskDetails />
                </ProtectedRoute>

              }
            />
            <Route
              path="/projects/:taskId/details"
              element={
                <ProtectedRoute>
                  <TaskDetails />
                </ProtectedRoute>

              }
            />

            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId"
              element={
                <ProtectedRoute>
                  <ProjectDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/members"
              element={
                <ProtectedRoute>
                  <Members />
                </ProtectedRoute>
              }
            />

            <Route
              path="/team-tasks"
              element={
                <ProtectedRoute>
                  <TeamTasks />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/ai-productivity"
              element={
                <ProtectedRoute>
                  <AIProductivity />
                </ProtectedRoute>
              }
            />

          </Routes>
        </BrowserRouter>
      </WorkspaceProvider>
    </AuthProvider>
  );
}

export default App;