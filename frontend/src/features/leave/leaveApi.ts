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

// Filters for Leave List
export interface LeaveFilters {
  fromDate?: string;
  toDate?: string;
  status?: LeaveStatus | "";
  typeId?: string;
  employeeId?: string;
  subUnit?: string;
  includePastEmployees?: boolean;
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

    // GET /api/leave  (Leave List – admin / HR)
    getAllLeaves: builder.query<LeaveRequest[], LeaveFilters | void>({
      query: (filters) => {
        if (!filters) return "leave";

        const params: any = {};
        if (filters.fromDate) params.fromDate = filters.fromDate;
        if (filters.toDate) params.toDate = filters.toDate;
        if (filters.status) params.status = filters.status;
        if (filters.typeId) params.typeId = filters.typeId;
        if (filters.employeeId) params.employeeId = filters.employeeId;
        // subUnit / includePastEmployees can be wired later if backend supports
        return { url: "leave", params };
      },
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
