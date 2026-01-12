import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppNotification,
  useDeleteNotificationMutation,
  useGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllReadMutation,
  useMarkNotificationReadMutation,
} from "../../features/notifications/notificationsApi";

type FilterMode = "all" | "unread" | "read";

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
      return "bg-red-500";
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
      return "bg-orange-500";
    case "ORDER":
      return "bg-blue-500";
    case "INVOICE":
      return "bg-lime-500";
    case "APPROVAL":
      return "bg-purple-500";
    default:
      return "bg-slate-400";
  }
};

function pickMetaLine(n: AppNotification): string | null {
  const meta: any = (n as any).meta || {};

  // ✅ If backend sends these, we show them:
  const approvedBy =
    meta.approvedByName ||
    meta.reviewedByName ||
    meta.adminName ||
    meta.approvedBy ||
    meta.reviewedBy;

  const changeRequestId = meta.changeRequestId || meta.crId || meta.requestId;
  const module = meta.module;
  const modelName = meta.modelName;
  const action = meta.action;

  // Build a nice line like: "EMPLOYEES • Employee • UPDATE"
  const parts = [module, modelName, action].filter(Boolean);
  const context = parts.length ? parts.join(" • ") : null;

  // Approval-specific line
  if (approvedBy) {
    if (context) return `${context} • Approved by ${approvedBy}`;
    return `Approved by ${approvedBy}`;
  }

  // If we at least have context or CR id
  if (context && changeRequestId) return `${context} • Ref: ${String(changeRequestId).slice(0, 8)}…`;
  if (context) return context;
  if (changeRequestId) return `Ref: ${String(changeRequestId).slice(0, 8)}…`;

  return null;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterMode>("all");

  // pagination
  const [cursor, setCursor] = useState<string | null>(null);
  const [allItems, setAllItems] = useState<AppNotification[]>([]);

  const { data: unreadData, refetch: refetchUnread } = useGetUnreadCountQuery();
  const unreadCount = unreadData?.count ?? 0;

  const { data, isFetching, refetch } = useGetMyNotificationsQuery({
    limit: 20,
    cursor: cursor ?? undefined,
  });

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllReadMutation();
  const [deleteOne] = useDeleteNotificationMutation();

  // append page results
  useEffect(() => {
    if (!data?.items) return;
    setAllItems((prev) => {
      const map = new Map<string, AppNotification>();
      [...prev, ...data.items].forEach((n) => map.set(n._id, n));
      return Array.from(map.values()).sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
      );
    });
  }, [data?.items]);

  // when filter changes, reset pagination list
  useEffect(() => {
    setCursor(null);
    setAllItems([]);
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const visibleItems = useMemo(() => {
    if (filter === "unread") return allItems.filter((n) => !n.read);
    if (filter === "read") return allItems.filter((n) => !!n.read);
    return allItems;
  }, [allItems, filter]);

  const readCount = useMemo(
    () => allItems.filter((n) => !!n.read).length,
    [allItems]
  );

  async function openNotification(n: AppNotification) {
    if (!n.read) {
      try {
        await markRead({ id: n._id }).unwrap();
        refetchUnread();
        // keep UI in sync immediately
        setAllItems((prev) =>
          prev.map((x) => (x._id === n._id ? { ...x, read: true } : x))
        );
      } catch {}
    }
    if (n.link) navigate(n.link);
  }

  async function loadMore() {
    if (!data?.hasMore || isFetching) return;
    if (data.nextCursor) setCursor(data.nextCursor);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Notifications</h1>
          <p className="text-sm text-slate-500">
            View all your notifications and manage them.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCursor(null);
              setAllItems([]);
              refetch();
              refetchUnread();
            }}
            className="px-4 py-2 rounded-md border bg-white text-sm hover:bg-slate-50"
          >
            Refresh
          </button>

          <button
            type="button"
            disabled={isMarkingAll || allItems.length === 0}
            onClick={async () => {
              try {
                await markAllRead().unwrap();
                // mark everything read in UI
                setAllItems((prev) => prev.map((n) => ({ ...n, read: true })));
                refetchUnread();
              } catch {}
            }}
            className="px-4 py-2 rounded-md bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-60"
          >
            Mark all read
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-sm border transition ${
            filter === "all"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          All
        </button>

        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-full text-sm border transition ${
            filter === "unread"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Unread {unreadCount > 0 ? `(${unreadCount})` : ""}
        </button>

        <button
          type="button"
          onClick={() => setFilter("read")}
          className={`px-4 py-2 rounded-full text-sm border transition ${
            filter === "read"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Read {readCount > 0 ? `(${readCount})` : ""}
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-700">
            {filter === "unread"
              ? "Unread notifications"
              : filter === "read"
              ? "Read notifications"
              : "All notifications"}
          </div>
          <div className="text-[11px] text-slate-500">
            {visibleItems.length} item{visibleItems.length === 1 ? "" : "s"}
          </div>
        </div>

        <div>
          {visibleItems.length === 0 && !isFetching ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              No notifications found.
            </div>
          ) : (
            <div className="divide-y">
              {visibleItems.map((n) => {
                const metaLine = pickMetaLine(n);
                return (
                  <div
                    key={n._id}
                    className={`px-6 py-4 flex gap-3 hover:bg-slate-50 cursor-pointer ${
                      n.read ? "opacity-85" : ""
                    }`}
                    onClick={() => openNotification(n)}
                  >
                    <div className="pt-1">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${typeDot(
                          n.type
                        )}`}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-800">
                            {n.title}
                          </div>

                          {metaLine ? (
                            <div className="text-[12px] text-slate-500 mt-0.5">
                              {metaLine}
                            </div>
                          ) : null}

                          {n.message ? (
                            <div className="text-sm text-slate-600 mt-1">
                              {n.message}
                            </div>
                          ) : null}
                        </div>

                        <div className="text-xs text-slate-400 whitespace-nowrap">
                          {timeAgo(n.createdAt)}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        {!n.read && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                            New
                          </span>
                        )}

                        {n.link ? (
                          <span className="text-[11px] text-slate-400">
                            Click to open
                          </span>
                        ) : null}

                        <button
                          type="button"
                          className="ml-auto text-[11px] text-slate-400 hover:text-slate-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteOne({ id: n._id });
                            refetchUnread();
                            setAllItems((prev) => prev.filter((x) => x._id !== n._id));
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer load more */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <button
              type="button"
              className="text-sm text-slate-600 hover:text-slate-800"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>

            <button
              type="button"
              disabled={!data?.hasMore || isFetching}
              onClick={loadMore}
              className="px-4 py-2 rounded-md border bg-white text-sm hover:bg-slate-50 disabled:opacity-60"
            >
              {isFetching ? "Loading..." : data?.hasMore ? "Load more" : "No more"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
