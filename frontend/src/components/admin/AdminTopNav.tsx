import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  LogOut,
  ShieldCheck,
  LayoutGrid,
} from "lucide-react";
import { useMeQuery } from "../../features/auth/authApi";

const mainTabs = [
  { name: "User Management", path: "/admin/user-management" },
  { name: "Approvals", path: "/admin/approvals" },
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
  // {
  //   name: "Configuration",
  //   dropdown: [
  //     {
  //       name: "Email Configuration",
  //       path: "/admin/configuration/email-config",
  //     },
  //   ],
  // },
];

export default function AdminTopNav() {
  const { pathname } = useLocation();

  const [userMenu, setUserMenu] = useState(false);
  const [openTab, setOpenTab] = useState<string | null>(null);

  const { data } = useMeQuery();
  const user = data?.user as any;

  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const tabsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;

      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenu(false);
      }

      if (tabsRef.current && !tabsRef.current.contains(target)) {
        setOpenTab(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setOpenTab(null);
    setUserMenu(false);
  }, [pathname]);

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

  const activeTabName = useMemo(() => {
    const found = mainTabs.find((tab) => {
      if ((tab as any).path) return isActive((tab as any).path);
      return tab.dropdown?.some((d) => isActive(d.path));
    });
    return found?.name || "Admin";
  }, [pathname]);

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
    <div className="w-full">
      {/* Top header */}
      <div className="bg-gradient-to-r from-green-500 via-green-500 to-emerald-500 text-white shadow-sm">
        <div className="px-4 sm:px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>

            <div className="min-w-0">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/80">
                Admin Panel
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <h1 className="truncate text-lg sm:text-xl font-semibold tracking-tight text-white">
                  {activeTabName}
                </h1>
                <span className="hidden sm:inline-flex rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium text-white/90 ring-1 ring-white/15">
                  Control Center
                </span>
              </div>
            </div>
          </div>

          <div
            ref={userMenuRef}
            className="relative flex items-center justify-end"
          >
            <button
              type="button"
              onClick={() => setUserMenu((v) => !v)}
              className="group inline-flex max-w-full items-center gap-3 rounded-full border border-white/15 bg-white/12 px-2.5 py-1.5 text-sm backdrop-blur-md transition hover:bg-white/20"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-green-700 shadow-sm">
                {initials}
              </div>

              <div className="hidden sm:block text-left min-w-0">
                <div className="truncate text-sm font-semibold text-white">
                  {displayName}
                </div>
                <div className="truncate text-[11px] text-white/75">
                  Administrator Access
                </div>
              </div>

              <ChevronDown
                className={`h-4 w-4 shrink-0 text-white/90 transition-transform ${
                  userMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {userMenu && (
              <div className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl z-[90]">
                <div className="border-b border-slate-100 px-4 py-4">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {displayName}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 truncate">
                    {user?.email || user?.username || "Logged in user"}
                  </div>
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="relative z-[40] border-b border-slate-200 bg-white">
        <div className="px-3 sm:px-4 lg:px-6 py-3">
          <div
            ref={tabsRef}
            className="flex flex-wrap items-center gap-2 overflow-visible"
          >
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
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-green-50 text-green-700 border border-green-200 shadow-sm"
                        : "bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100"
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4 opacity-70" />
                    <span>{tab.name}</span>
                  </Link>
                );
              }

              return (
                <div key={tab.name} className="relative overflow-visible">
                  <button
                    type="button"
                    onClick={() => toggleDropdown(tab.name)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition ${
                      active || openTab === tab.name
                        ? "bg-green-50 text-green-700 border border-green-200 shadow-sm"
                        : "bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100"
                    }`}
                  >
                    <span>{tab.name}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        openTab === tab.name ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openTab === tab.name && (
                    <div className="absolute left-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl z-[100]">
                      <div className="border-b border-slate-100 px-4 py-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {tab.name}
                        </div>
                      </div>

                      <div className="p-2">
                        {tab.dropdown.map((item) => {
                          const itemActive = isActive(item.path);

                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              className={`block rounded-xl px-4 py-3 text-sm transition ${
                                itemActive
                                  ? "bg-green-50 text-green-700 font-semibold"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              }`}
                              onClick={() => setOpenTab(null)}
                            >
                              {item.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}