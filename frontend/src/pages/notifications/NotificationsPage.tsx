// frontend/src/pages/notifications/NotificationsPage.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllReadMutation,
  useMarkNotificationReadMutation,
} from "../../features/notifications/notificationsApi";

type StatusTab = "ALL" | "UNREAD" | "READ";
type CategoryTab = "ALL" | "LEAVE" | "INFO_UPDATE";

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

const dotByType = (type?: string) => {
  switch (type) {
    case "LEAVE":
      return "bg-teal-500";
    case "INFO":
      return "bg-sky-500";
    case "APPROVAL":
      return "bg-violet-500";
    case "SUCCESS":
      return "bg-emerald-500";
    case "WARNING":
      return "bg-amber-500";
    case "ERROR":
      return "bg-red-500";
    default:
      return "bg-slate-400";
  }
};

const badgeByType = (type?: string) => {
  switch (type) {
    case "LEAVE":
      return "bg-teal-50 text-teal-700 border-teal-100";
    case "INFO":
      return "bg-sky-50 text-sky-700 border-sky-100";
    case "APPROVAL":
      return "bg-violet-50 text-violet-700 border-violet-100";
    case "SUCCESS":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "WARNING":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "ERROR":
      return "bg-red-50 text-red-700 border-red-100";
    default:
      return "bg-slate-50 text-slate-700 border-slate-100";
  }
};

const isRead = (n: any) => Boolean(n.read ?? n.isRead);

function isInfoUpdate(n: any) {
  // tune later if needed
  if (n.type === "INFO" || n.type === "APPROVAL") return true;
  const mod = String(n?.meta?.module || n?.meta?.source || "").toLowerCase();
  if (mod.includes("employee") || mod.includes("my info") || mod.includes("profile"))
    return true;
  return false;
}

function PillButton({
  active,
  onClick,
  children,
  tone = "default",
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "default" | "red";
}) {
  const base =
    "h-10 px-4 rounded-full border text-sm transition-all duration-150 whitespace-nowrap";
  const activeCls =
    tone === "red"
      ? "bg-red-600 text-white border-red-600 shadow-sm"
      : "bg-slate-900 text-white border-slate-900 shadow-sm";
  const idleCls =
    "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300";
  return (
    <button type="button" onClick={onClick} className={`${base} ${active ? activeCls : idleCls}`}>
      {children}
    </button>
  );
}

function SoftButton({
  onClick,
  children,
  disabled,
  tone = "default",
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  tone?: "default" | "primary";
}) {
  const base =
    "h-10 px-4 rounded-xl text-sm border transition-all duration-150 flex items-center gap-2";
  const cls =
    tone === "primary"
      ? "bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 disabled:opacity-50"
      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50";
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${cls}`}>
      {children}
    </button>
  );
}

export default function NotificationsPage() {
  const navigate = useNavigate();

  const [statusTab, setStatusTab] = useState<StatusTab>("ALL");
  const [categoryTab, setCategoryTab] = useState<CategoryTab>("ALL");
  const [limit, setLimit] = useState(20);

  const { data: unreadData, refetch: refetchUnread } = useGetUnreadCountQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const { data, refetch, isFetching } = useGetMyNotificationsQuery(
    { limit },
    { refetchOnFocus: true, refetchOnReconnect: true }
  );

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllReadMutation();

  const unreadCount = unreadData?.count ?? 0;
  const items = (data?.items ?? []) as any[];

  const filtered = useMemo(() => {
    let arr = [...items];

    // status filter
    if (statusTab === "UNREAD") arr = arr.filter((n) => !isRead(n));
    if (statusTab === "READ") arr = arr.filter((n) => isRead(n));

    // category filter
    if (categoryTab === "LEAVE") arr = arr.filter((n) => n.type === "LEAVE");
    if (categoryTab === "INFO_UPDATE") arr = arr.filter((n) => isInfoUpdate(n));

    return arr;
  }, [items, statusTab, categoryTab]);

  async function onClickNotification(n: any) {
    if (!isRead(n)) {
      try {
        await markRead({ id: n._id }).unwrap();
        refetchUnread();
        refetch();
      } catch {}
    }
    if (n.link) navigate(n.link);
  }

  const headerTitle =
    categoryTab === "LEAVE"
      ? "Leave notifications"
      : categoryTab === "INFO_UPDATE"
      ? "Info update notifications"
      : "All notifications";

  return (
    <div className="w-full">
      {/* Page header (title area) */}
      <div className="mb-4">
        <div className="text-2xl font-semibold text-slate-900">Notifications</div>
        <div className="text-sm text-slate-500 mt-1">
          View all your notifications and manage them.
        </div>
      </div>

      {/* ✅ Dedicated topbar */}
      <div className="sticky top-0 z-20 -mx-6 px-6 py-4 bg-slate-100/80 backdrop-blur supports-[backdrop-filter]:bg-slate-100/60">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-4 flex flex-col gap-3">
            {/* Top row: status + actions */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <PillButton active={statusTab === "ALL"} onClick={() => setStatusTab("ALL")}>
                  All
                </PillButton>
                <PillButton
                  active={statusTab === "UNREAD"}
                  onClick={() => setStatusTab("UNREAD")}
                >
                  Unread
                  {unreadCount > 0 ? (
                    <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
                      {unreadCount}
                    </span>
                  ) : null}
                </PillButton>
                <PillButton active={statusTab === "READ"} onClick={() => setStatusTab("READ")}>
                  Read
                </PillButton>
              </div>

              <div className="flex flex-wrap items-center gap-2 justify-start lg:justify-end">
                <SoftButton
                  onClick={() => {
                    refetchUnread();
                    refetch();
                  }}
                  disabled={isFetching}
                >
                  ⟳ Refresh
                </SoftButton>

                <SoftButton
                  tone="primary"
                  disabled={isMarkingAll || items.length === 0}
                  onClick={async () => {
                    try {
                      await markAllRead().unwrap();
                      refetchUnread();
                      refetch();
                    } catch {}
                  }}
                >
                  ✓ Mark all read
                </SoftButton>
              </div>
            </div>

            {/* Bottom row: category filters + summary */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-slate-100 pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 tracking-wide mr-1">
                  FILTER
                </span>
                <PillButton
                  active={categoryTab === "ALL"}
                  onClick={() => setCategoryTab("ALL")}
                >
                  All types
                </PillButton>
                <PillButton
                  active={categoryTab === "LEAVE"}
                  onClick={() => setCategoryTab("LEAVE")}
                >
                  Leave
                </PillButton>
                <PillButton
                  active={categoryTab === "INFO_UPDATE"}
                  onClick={() => setCategoryTab("INFO_UPDATE")}
                >
                  Info update
                </PillButton>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-800">{filtered.length}</span> item(s)
                </div>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <div className="text-slate-500">
                  Unread{" "}
                  <span className="font-semibold text-slate-800">{unreadCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-800">{headerTitle}</div>
          <div className="text-xs text-slate-400">{filtered.length} item(s)</div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl">
              🔔
            </div>
            <div className="mt-3 text-sm font-semibold text-slate-800">
              {isFetching ? "Loading notifications..." : "No notifications found"}
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Try changing filters or hit refresh.
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((n: any) => {
              const unread = !isRead(n);
              return (
                <button
                  key={n._id}
                  type="button"
                  onClick={() => onClickNotification(n)}
                  className={`w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors ${
                    unread ? "bg-white" : "bg-white/70"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Left marker */}
                    <div className="pt-1.5">
                      <div className="relative">
                        <span
                          className={`inline-block w-3 h-3 rounded-full ${dotByType(n.type)}`}
                        />
                        {unread ? (
                          <span className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                        ) : null}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="text-[14px] font-semibold text-slate-900 truncate">
                              {n.title}
                            </div>

                            {unread ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
                                New
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-100">
                                Read
                              </span>
                            )}

                            {n.type ? (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full border ${badgeByType(
                                  n.type
                                )}`}
                              >
                                {String(n.type).toLowerCase()}
                              </span>
                            ) : null}
                          </div>

                          {n.message ? (
                            <div className="text-[13px] text-slate-600 mt-1 leading-snug line-clamp-2">
                              {n.message}
                            </div>
                          ) : null}

                          {n.link ? (
                            <div className="mt-2 text-[12px] text-slate-400">
                              Click to open
                            </div>
                          ) : null}
                        </div>

                        {/* Right time */}
                        <div className="text-[11px] text-slate-400 whitespace-nowrap pt-0.5">
                          {n.createdAt ? timeAgo(n.createdAt) : ""}
                        </div>
                      </div>
                    </div>

                    {/* Right chevron */}
                    <div className="pt-1 text-slate-300">
                      <span className="text-lg">›</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            className="text-sm text-slate-600 hover:text-slate-900"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <button
            type="button"
            disabled={isFetching}
            className="px-4 h-10 rounded-xl border border-slate-200 bg-white text-sm hover:bg-slate-50 disabled:opacity-50"
            onClick={() => setLimit((v) => Math.min(200, v + 20))}
          >
            {limit >= 200 ? "No more" : "Load more"}
          </button>
        </div>
      </div>
    </div>
  );
}
