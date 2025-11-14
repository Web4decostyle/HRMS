// frontend/src/components/Topbar.tsx
import { useNavigate, useLocation } from "react-router-dom";
import { useMeQuery } from "../features/auth/authApi";

export default function Topbar() {
  const { data } = useMeQuery();
  const navigate = useNavigate();
  const location = useLocation();

  const user = data?.user;
  const fullName = user ? `${user.firstName} ${user.lastName}` : "User";
  const roleLabel = user?.role ?? "ESS";

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  // Simple page title based on route (you can improve later)
  function getPageTitle() {
    if (location.pathname.startsWith("/employees")) return "Employees";
    if (location.pathname.startsWith("/leave")) return "Leave";
    if (location.pathname.startsWith("/time")) return "Time";
    if (location.pathname.startsWith("/recruitment")) return "Recruitment";
    if (location.pathname.startsWith("/my-info")) return "My Info";
    if (location.pathname.startsWith("/admin")) return "Admin";
    return "Dashboard";
  }

  return (
    <header className="h-14 px-5 border-b bg-white flex items-center justify-between">
      {/* Left side: page title */}
      <div>
        <h1 className="text-base font-semibold text-slate-800">
          {getPageTitle()}
        </h1>
        <p className="text-[11px] text-slate-400">
          DecoStyle · {roleLabel}
        </p>
      </div>

      {/* Right side: search + icons + user */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center px-2 py-1 rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-500 w-56">
          <span className="mr-2">🔍</span>
          <input
            placeholder="Search"
            className="bg-transparent outline-none flex-1 text-[11px]"
          />
        </div>

        {/* Icons */}
        <button
          type="button"
          className="text-lg"
          title="Help"
        >
          ❓
        </button>
        <button
          type="button"
          className="text-lg"
          title="Notifications"
        >
          🔔
        </button>

        {/* User dropdown (simplified) */}
        <div className="flex items-center gap-2 pl-3 ml-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-semibold">
            {fullName
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="leading-tight">
            <div className="text-xs font-medium text-slate-800">
              {fullName}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-[11px] text-green-600 hover:text-green-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
