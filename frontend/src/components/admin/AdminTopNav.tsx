import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useMeQuery } from "../../features/auth/authApi";

const mainTabs = [
  { name: "User Management", path: "/admin/user-management" },

  // ✅ (Optional) Approvals tab - since you already have it
  { name: "Approvals", path: "/admin/approvals" },

  // ✅ History tab
  { name: "History", path: "/admin/history" },

  {
    name: "Job",
    dropdown: [
      { name: "Job Titles", path: "/admin/job/job-titles" },
      { name: "Pay Grades", path: "/admin/job/pay-grades" },
      { name: "Employment Status", path: "/admin/job/employment-status" },
      { name: "Job Categories", path: "/admin/job/job-categories" },
      { name: "Work Shifts", path: "/admin/job/work-shifts" },
    ],
  },
  {
    name: "Organization",
    dropdown: [
      { name: "General Information", path: "/admin/org/general-info" },
      { name: "Locations", path: "/admin/org/locations" },
      { name: "Structure", path: "/admin/org/structure" },
    ],
  },
  {
    name: "Qualifications",
    dropdown: [
      { name: "Skills", path: "/admin/qualifications/skills" },
      { name: "Education", path: "/admin/qualifications/education" },
      { name: "Licenses", path: "/admin/qualifications/licenses" },
      { name: "Languages", path: "/admin/qualifications/languages" },
    ],
  },
  {
    name: "Configuration",
    dropdown: [
      {
        name: "Email Configuration",
        path: "/admin/configuration/email-config",
      },
    ],
  },
];

export default function AdminTopNav() {
  const { pathname } = useLocation();

  const [userMenu, setUserMenu] = useState(false);
  const [openTab, setOpenTab] = useState<string | null>(null);

  const { data } = useMeQuery();
  const user = data?.user as any;

  const displayName: string =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.fullName ||
    user?.name ||
    user?.username ||
    "User";

  const initials: string =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w: string) => w[0]!.toUpperCase())
      .join("") || "U";

  const isActive = (path: string) => pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  const toggleDropdown = (tabName: string) => {
    setOpenTab((prev) => (prev === tabName ? null : tabName));
  };

  return (
    <div className="w-full bg-white">
      {/* Top red gradient bar */}
      <div className="w-full bg-gradient-to-r from-red-500 to-red-500 text-white px-6 py-3 flex items-center justify-between">
        <h1 className="text-sm font-semibold">Admin</h1>

        <div className="flex items-center gap-3">
          {/* User menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenu((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/30 rounded-full text-sm hover:bg-white/40 transition"
            >
              <div className="h-7 w-7 rounded-full bg-white/70 border border-white/50 flex items-center justify-center text-[11px] font-semibold text-slate-700">
                {initials}
              </div>
              <span className="text-white font-medium">{displayName}</span>
              <ChevronDown className="w-4 h-4 text-white" />
            </button>

            {userMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-xl rounded-xl border border-slate-100 z-50">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-2 text-red-500 hover:bg-slate-100"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="relative bg-white border-b">
        <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
          {mainTabs.map((tab) => {
            const active =
              (tab as any).path && isActive((tab as any).path)
                ? true
                : tab.dropdown?.some((d) => isActive(d.path));

            if (!tab.dropdown) {
              return (
                <Link
                  key={tab.name}
                  to={(tab as any).path}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    active
                      ? "bg-red-100 text-red-600 border border-red-300"
                      : "bg-slate-100 text-slate-600 hover:bg-red-50"
                  }`}
                >
                  {tab.name}
                </Link>
              );
            }

            return (
              <div key={tab.name} className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown(tab.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1 ${
                    active || openTab === tab.name
                      ? "bg-red-100 text-red-600 border border-red-300"
                      : "bg-slate-100 text-slate-600 hover:bg-red-50"
                  }`}
                >
                  {tab.name}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {openTab === tab.name && (
                  <div
                    className="
                      absolute left-1/2 -translate-x-1/2 top-full mt-2
                      bg-white rounded-2xl shadow-lg border border-slate-100
                      z-50 w-56 py-2
                    "
                  >
                    {tab.dropdown.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="block px-5 py-2 text-xs text-slate-500 hover:bg-red-50 hover:text-red-500"
                        onClick={() => setOpenTab(null)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
