// frontend/src/features/leave/leaveApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface LeaveType {
  _id: string;
  name: string;
  code: string;
  description?: string;
}

export interface LeaveRequest {
  _id: string;
  employee: any;
  type: LeaveType | string;
  fromDate: string;
  toDate: string;
  days: number;
  reason?: string;
  status: LeaveStatus;
  createdAt?: string;
}

export const leaveApi = createApi({
  reducerPath: "leaveApi",
  baseQuery: authorizedBaseQuery,
  tagTypes: ["LeaveType", "LeaveRequest"],
  endpoints: (builder) => ({
    // GET /api/leave/types
    getLeaveTypes: builder.query<LeaveType[], void>({
      query: () => "leave/types",
      providesTags: ["LeaveType"],
    }),

    // POST /api/leave
    applyLeave: builder.mutation<
      LeaveRequest,
      { typeId: string; fromDate: string; toDate: string; reason?: string }
    >({
      query: (body) => ({
        url: "leave",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LeaveRequest"],
    }),

    // GET /api/leave/my
    getMyLeaves: builder.query<LeaveRequest[], void>({
      query: () => "leave/my",
      providesTags: ["LeaveRequest"],
    }),

    // GET /api/leave  (admin / HR)
    getAllLeaves: builder.query<LeaveRequest[], void>({
      query: () => "leave",
      providesTags: ["LeaveRequest"],
    }),

    // PATCH /api/leave/:id/status (admin / HR)
    updateLeaveStatus: builder.mutation<
      LeaveRequest,
      { id: string; status: LeaveStatus }
    >({
      query: ({ id, status }) => ({
        url: `leave/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["LeaveRequest"],
    }),
  }),
});

export const {
  useGetLeaveTypesQuery,
  useApplyLeaveMutation,
  useGetMyLeavesQuery,
  useGetAllLeavesQuery,
  useUpdateLeaveStatusMutation,
} = leaveApi;
