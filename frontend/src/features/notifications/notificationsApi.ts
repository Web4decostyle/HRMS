import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type NotificationType =
  | "SYSTEM"
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR"
  | "TASK"
  | "LEAVE"
  | "TIME"
  | "RECRUITMENT"
  | "PIM"
  | "ORDER"
  | "INVOICE";

export interface AppNotification {
  _id: string;
  title: string;
  message?: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: string;
}

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:4000",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Notifications", "UnreadCount"],
  endpoints: (builder) => ({
    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => `/api/notifications/unread-count`,
      providesTags: ["UnreadCount"],
    }),

    getMyNotifications: builder.query<
      { items: AppNotification[]; nextCursor: string | null; hasMore: boolean },
      { limit?: number; cursor?: string } | void
    >({
      query: (args) => {
        const limit = args?.limit ?? 10;
        const cursor = args?.cursor ? `&cursor=${encodeURIComponent(args.cursor)}` : "";
        return `/api/notifications?limit=${limit}${cursor}`;
      },
      providesTags: (res) =>
        res?.items
          ? [
              ...res.items.map((n) => ({ type: "Notifications" as const, id: n._id })),
              { type: "Notifications" as const, id: "LIST" },
            ]
          : [{ type: "Notifications" as const, id: "LIST" }],
    }),

    markNotificationRead: builder.mutation<{ item: AppNotification }, { id: string }>({
      query: ({ id }) => ({
        url: `/api/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: (r, e, a) => [
        { type: "Notifications", id: a.id },
        "UnreadCount",
        { type: "Notifications", id: "LIST" },
      ],
    }),

    markAllRead: builder.mutation<{ modified: number }, void>({
      query: () => ({
        url: `/api/notifications/mark-all-read`,
        method: "PATCH",
      }),
      invalidatesTags: ["UnreadCount", { type: "Notifications", id: "LIST" }],
    }),

    deleteNotification: builder.mutation<{ ok: true }, { id: string }>({
      query: ({ id }) => ({
        url: `/api/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (r, e, a) => [
        { type: "Notifications", id: a.id },
        "UnreadCount",
        { type: "Notifications", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetUnreadCountQuery,
  useGetMyNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllReadMutation,
  useDeleteNotificationMutation,
} = notificationsApi;
