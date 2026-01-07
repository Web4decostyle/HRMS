import { createApi } from "@reduxjs/toolkit/query/react";
import { authedBaseQuery } from "../apiBase";

export type ChangeRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ChangeAction = "CREATE" | "UPDATE" | "DELETE";

export interface ChangeRequest {
  _id: string;
  status: ChangeRequestStatus;

  module: string;
  modelName: string;
  action: ChangeAction;

  targetId?: string;
  payload: any;
  reason?: string;

  requestedBy: string;
  requestedByRole: string;

  reviewedBy?: string;
  reviewedAt?: string;
  decisionReason?: string;

  createdAt: string;
  updatedAt: string;
}

export const changeRequestsApi = createApi({
  reducerPath: "changeRequestsApi",
  baseQuery: authedBaseQuery,
  tagTypes: ["ChangeRequests"],
  endpoints: (builder) => ({
    // Admin queue
    getPending: builder.query<ChangeRequest[], void>({
      query: () => ({
        url: "change-requests/pending",
        method: "GET",
      }),
      providesTags: ["ChangeRequests"],
    }),

    // User's own requests (HR can track)
    getMine: builder.query<ChangeRequest[], void>({
      query: () => ({
        url: "change-requests/mine",
        method: "GET",
      }),
      providesTags: ["ChangeRequests"],
    }),

    approve: builder.mutation<{ ok: boolean; approved: boolean }, { id: string }>({
      query: ({ id }) => ({
        url: `change-requests/${id}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["ChangeRequests"],
    }),

    reject: builder.mutation<
      { ok: boolean; approved: boolean },
      { id: string; decisionReason?: string }
    >({
      query: ({ id, decisionReason }) => ({
        url: `change-requests/${id}/reject`,
        method: "POST",
        body: { decisionReason },
      }),
      invalidatesTags: ["ChangeRequests"],
    }),
  }),
});

export const {
  useGetPendingQuery,
  useGetMineQuery,
  useApproveMutation,
  useRejectMutation,
} = changeRequestsApi;
