import { useNavigate, useLocation } from "react-router-dom";
import { useMeQuery } from "../features/auth/authApi";

interface TopbarProps {
  active?: string;
}

export default function Topbar({ active }: TopbarProps) {
  const { data } = useMeQuery();
  const navigate = useNavigate();
  const location = useLocation();

  const user = data?.user as any;

  const fullName: string =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.fullName ||
    user?.name ||
    user?.username ||
    "User";

  const roleLabel: string = user?.role ?? "ESS";

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    navigate("/login");
  }

  function getPageTitle() {
    if (location.pathname.startsWith("/employees")) return "Employees";
    if (location.pathname.startsWith("/leave")) return "Leave";
    if (location.pathname.startsWith("/time")) return "Time";
    if (location.pathname.startsWith("/recruitment")) return "Recruitment";
    if (location.pathname.startsWith("/my-info")) return "My Info";
    if (location.pathname.startsWith("/admin/pim")) return "PIM";
    if (location.pathname.startsWith("/admin")) return "Admin";
    return "Dashboard";
  }

  const initials: string =
    fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p: string) => p[0]!.toUpperCase())
      .join("") || "U";

  return (
    <header className="h-14 px-5 border-b bg-white flex items-center justify-between">
      <div>
        <h1 className="text-base font-semibold text-slate-800">
          {getPageTitle()}
        </h1>
        <p className="text-[11px] text-slate-400">DecoStyle · {roleLabel}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center px-2 py-1 rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-500 w-56">
          <span className="mr-2">🔍</span>
          <input
            placeholder="Search"
            className="bg-transparent outline-none flex-1 text-[11px]"
          />
        </div>

        <button type="button" className="text-lg" title="Help">
          ❓
        </button>
        <button type="button" className="text-lg" title="Notifications">
          🔔
        </button>

        <div className="flex items-center gap-2 pl-3 ml-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>
          <div className="leading-tight">
            <div className="text-xs font-medium text-slate-800">{fullName}</div>
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
