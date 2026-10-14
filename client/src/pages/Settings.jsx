import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Mail, User, Settings as SettingsIcon } from "lucide-react";
import AppLayout from "../components/AppLayout";
import { AuthContext } from "../context/AuthContext";

const Settings = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");

    setUser(null);

    navigate("/login");
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <SettingsIcon size={22} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Settings
              </h1>

              <p className="text-slate-500 mt-1">
                Manage your account and workspace preferences
              </p>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Profile
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Your TaskFlow account information
            </p>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {user?.name || "User"}
                </h3>

                <p className="text-slate-500">
                  TaskFlow Member
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">
                  Name
                </label>

                <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 bg-slate-50">
                  <User size={18} className="text-slate-400" />

                  <span className="text-slate-900">
                    {user?.name || "—"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">
                  Email
                </label>

                <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 bg-slate-50">
                  <Mail size={18} className="text-slate-400" />

                  <span className="text-slate-900">
                    {user?.email || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Account
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Manage your current session
            </p>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">
                Logout
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Sign out of your TaskFlow account
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition font-medium"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;