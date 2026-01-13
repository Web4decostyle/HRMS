import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type AuditAction =
  | "CHANGE_REQUEST_CREATED"
  | "CHANGE_REQUEST_APPROVED"
  | "CHANGE_REQUEST_REJECTED";

export interface AuditLog {
  _id: string;
  action: AuditAction;

  actorId: string;
  actorRole: string;

  // ✅ NEW (for display)
  actorUsername?: string;
  actorName?: string;

  module: string;
  modelName: string;
  actionType: "CREATE" | "UPDATE" | "DELETE";
  targetId?: string;

  changeRequestId?: string;

  before?: any;
  after?: any;
  appliedResult?: any;

  approvedAt?: string;
  approvedBy?: string;

  // ✅ NEW
  approvedByUsername?: string;
  approvedByName?: string;

  decisionReason?: string;

  ip?: string;
  userAgent?: string;

  // ✅ meta should exist for requestedByUsername
  meta?: Record<string, any>;

  createdAt: string;
  updatedAt: string;
}

export interface AuditHistoryResponse {
  items: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export const auditApi = createApi({
  reducerPath: "auditApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:4000",
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getAuditHistory: builder.query<
      AuditHistoryResponse,
      {
        module?: string;
        modelName?: string;
        action?: string;
        actionType?: string;
        q?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: (params) => {
        const sp = new URLSearchParams();
        if (params.module) sp.set("module", params.module);
        if (params.modelName) sp.set("modelName", params.modelName);
        if (params.action) sp.set("action", params.action);
        if (params.actionType) sp.set("actionType", params.actionType);
        if (params.q) sp.set("q", params.q);
        sp.set("page", String(params.page ?? 1));
        sp.set("limit", String(params.limit ?? 500));
        return `/api/audit?${sp.toString()}`;
      },
    }),
  }),
});

export const { useGetAuditHistoryQuery } = auditApi;
