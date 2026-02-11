// frontend/src/components/Topbar.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMeQuery } from "../features/auth/authApi";
import {
  useGetUnreadCountQuery,
  useGetMyNotificationsQuery,
  useMarkAllReadMutation,
  useMarkNotificationReadMutation,
  useDeleteNotificationMutation,
  AppNotification,
} from "../features/notifications/notificationsApi";
import { connectSocket, getSocket } from "../socket";

interface TopbarProps {
  active?: string;
}

function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

const typeDot = (type?: string) => {
  switch (type) {
    case "ERROR":
      return "bg-green-500";
    case "WARNING":
      return "bg-amber-500";
    case "SUCCESS":
      return "bg-emerald-500";
    case "LEAVE":
      return "bg-teal-500";
    case "TIME":
      return "bg-indigo-500";
    case "RECRUITMENT":
      return "bg-pink-500";
    case "PIM":
      return "bg-green-500";
    case "ORDER":
      return "bg-green-500";
    case "INVOICE":
      return "bg-lime-500";
    case "INFO":
      return "bg-sky-500";
    case "APPROVAL":
      return "bg-violet-500";
    default:
      return "bg-slate-400";
  }
};

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

  // ---------------- Notifications ----------------
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement | null>(null);

  // ✅ IMPORTANT: no RTK polling here (this was causing your spam)
  const {
    data: unreadData,
    refetch: refetchUnread,
    isFetching: isFetchingUnread,
  } = useGetUnreadCountQuery(undefined, {
    skip: !data?.user,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const { data: listData, refetch: refetchList } = useGetMyNotificationsQuery(
    { limit: 12 },
    {
      skip: !data?.user,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  const unreadCount = unreadData?.count ?? 0;
  const items = listData?.items ?? [];

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllReadMutation();

  // keeping mutation import (you used it before); dropdown still shows Delete button below,
  // if you want NO delete anywhere, remove the button too.
  const [deleteOne] = useDeleteNotificationMutation();

  // Close dropdown if clicked outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const t = e.target as any;
      if (popRef.current && !popRef.current.contains(t)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // ✅ Connect socket once per user
  const socketConnectedRef = useRef<string | null>(null);
  useEffect(() => {
    const uid = user?.id || user?._id;
    if (!uid) return;

    const s = String(uid);
    if (socketConnectedRef.current === s) return;

    socketConnectedRef.current = s;
    connectSocket(s);
  }, [user?.id, user?._id]);

  // ✅ Listen for real-time notifications
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onNew = () => {
      refetchUnread();
      refetchList();
    };

    socket.on("notification:new", onNew);
    return () => {
      socket.off("notification:new", onNew);
    };
  }, [refetchUnread, refetchList]);

  // ✅ Controlled interval refresh (1 request / 30s, not spam)
  useEffect(() => {
    if (!data?.user) return;

    let alive = true;
    const id = window.setInterval(() => {
      if (!alive) return;
      // only refresh count if tab is visible (prevents background hammering)
      if (document.visibilityState === "visible") {
        refetchUnread();
      }
    }, 30000);

    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [data?.user, refetchUnread]);

  async function onOpenBell() {
    setOpen((s) => !s);
    // when opening, fetch immediately
    if (!open) {
      refetchUnread();
      refetchList();
    }
  }

  async function handleClickNotification(n: AppNotification) {
    setOpen(false);

    if (!(n as any).read && !(n as any).isRead) {
      try {
        await markRead({ id: (n as any)._id }).unwrap();
      } catch {}
    }

    if ((n as any).link) navigate((n as any).link);
  }

  const isRead = (n: any) => Boolean(n.read ?? n.isRead);

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

        {/* Bell + Dropdown */}
        <div className="relative" ref={popRef}>
          <button
            type="button"
            onClick={onOpenBell}
            className="relative text-lg rounded-full w-9 h-9 flex items-center justify-center hover:bg-slate-100"
            title="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-green-500 text-white text-[10px] font-semibold flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-[360px] rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-50">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-800">
                  Notifications
                </div>
                <button
                  type="button"
                  disabled={isMarkingAll || items.length === 0}
                  onClick={async () => {
                    try {
                      await markAllRead().unwrap();
                      refetchUnread();
                      refetchList();
                    } catch {}
                  }}
                  className="text-[11px] text-green-600 hover:text-green-700 disabled:opacity-50"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-[340px] overflow-auto">
                {items.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-slate-500">
                    No notifications yet.
                  </div>
                ) : (
                  items.map((n: any) => (
                    <div
                      key={n._id}
                      className={`px-3 py-3 border-b border-slate-100 flex gap-3 cursor-pointer hover:bg-slate-50 ${
                        isRead(n) ? "opacity-85" : "bg-white"
                      }`}
                      onClick={() => handleClickNotification(n)}
                    >
                      <div className="pt-1">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${typeDot(
                            n.type,
                          )}`}
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-[13px] font-semibold text-slate-800 leading-snug">
                            {n.title}
                          </div>
                          <div className="text-[10px] text-slate-400 whitespace-nowrap">
                            {n.createdAt ? timeAgo(n.createdAt) : ""}
                          </div>
                        </div>

                        {n.message && (
                          <div className="text-[12px] text-slate-600 mt-0.5 leading-snug">
                            {n.message}
                          </div>
                        )}

                        <div className="mt-2 flex items-center gap-2">
                          {!isRead(n) && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                              New
                            </span>
                          )}

                          {/* OPTIONAL: If you want to remove delete from dropdown too, delete this button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteOne({ id: n._id });
                            }}
                            className="text-[11px] text-slate-400 hover:text-slate-600"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-3 py-2 bg-slate-50 flex items-center justify-between">
                <button
                  type="button"
                  className="text-[11px] text-slate-600 hover:text-slate-800"
                  onClick={() => {
                    setOpen(false);
                    navigate("/notifications");
                  }}
                >
                  View all
                </button>

                <button
                  type="button"
                  className="text-[11px] text-slate-600 hover:text-slate-800"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 pl-3 ml-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>

          <div className="flex flex-col leading-tight min-w-[120px]">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="text-xs font-medium text-slate-800 hover:underline text-left whitespace-nowrap"
              title="Open Profile"
            >
              {fullName}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="text-[11px] text-green-600 hover:text-green-700 text-left"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
