// frontend/src/features/leave/leaveApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type WorkDayKind = "FULL" | "HALF" | "NONE";

// ✅ support both old + new backend values
export type PendingWith =
  | "MANAGER"
  | "ADMIN"
  | "SUPERVISOR"
  | "HR"
  | null
  | undefined;

export interface LeaveType {
  _id: string;
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
}

export interface LeaveRequest {
  _id: string;
  employee: any;
  type: LeaveType | string;

  // frontend expects fromDate/toDate in list
  fromDate: string;
  toDate: string;

  // sometimes detail API may return startDate/endDate too
  startDate?: string;
  endDate?: string;

  days: number;
  reason?: string;

  status: LeaveStatus;

  // ✅ now supports Manager/Admin (and legacy)
  pendingWith?: PendingWith;

  // ✅ backend-calculated permissions for the CURRENT logged-in user
  canAct?: boolean; // can approve/reject
  canCancel?: boolean; // employee can cancel own pending request

  createdAt?: string;
  approval?: any;
  history?: Array<{
    action: string;
    byRole?: string;
    at?: string;
    remarks?: string;
  }>;
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

export interface WorkWeekConfig {
  _id?: string;
  monday: WorkDayKind;
  tuesday: WorkDayKind;
  wednesday: WorkDayKind;
  thursday: WorkDayKind;
  friday: WorkDayKind;
  saturday: WorkDayKind;
  sunday: WorkDayKind;
}

export interface Holiday {
  _id: string;
  name: string;
  date: string; // ISO date
  isHalfDay: boolean;
  repeatsAnnually: boolean;
}

export interface HolidayFilters {
  from?: string;
  to?: string;
}

export const leaveApi = createApi({
  reducerPath: "leaveApi",
  baseQuery: authorizedBaseQuery,
  tagTypes: ["LeaveType", "LeaveRequest", "WorkWeek", "Holiday"],
  endpoints: (builder) => ({
    // GET /api/leave/types
    getLeaveTypes: builder.query<LeaveType[], void>({
      query: () => "leave/types",
      providesTags: ["LeaveType"],
    }),

    // GET /api/leave/:id
    getLeaveById: builder.query<LeaveRequest, string>({
      query: (id) => `leave/${id}`,
      providesTags: ["LeaveRequest"],
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

    // GET /api/leave  (Leave List – admin / HR / supervisor)
    getAllLeaves: builder.query<LeaveRequest[], LeaveFilters | void>({
      query: (filters) => {
        if (!filters) return "leave";

        const params: any = {};
        if (filters.fromDate) params.fromDate = filters.fromDate;
        if (filters.toDate) params.toDate = filters.toDate;
        if (filters.status) params.status = filters.status;
        if (filters.typeId) params.typeId = filters.typeId;
        if (filters.employeeId) params.employeeId = filters.employeeId;

        return { url: "leave", params };
      },
      providesTags: ["LeaveRequest"],
    }),

    // PATCH /api/leave/:id/status (admin / HR / supervisor)
    updateLeaveStatus: builder.mutation<
      LeaveRequest,
      { id: string; status: LeaveStatus; remarks?: string }
    >({
      query: ({ id, status, remarks }) => ({
        url: `leave/${id}/status`,
        method: "PATCH",
        body: {
          status,
          ...(remarks && remarks.trim() ? { remarks: remarks.trim() } : {}),
        },
      }),
      invalidatesTags: ["LeaveRequest"],
    }),

    // POST /api/leave/assign
    assignLeave: builder.mutation<
      LeaveRequest,
      {
        employeeId: string;
        typeId: string;
        fromDate: string;
        toDate: string;
        reason?: string;
      }
    >({
      query: (body) => ({
        url: "leave/assign",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LeaveRequest"],
    }),

    // --- Leave Types: CRUD for Configure -> Leave Types ------------

    createLeaveType: builder.mutation<
      LeaveType,
      { name: string; code?: string; description?: string }
    >({
      query: (body) => ({
        url: "leave/types",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LeaveType"],
    }),

    deleteLeaveType: builder.mutation<{ message: string }, { id: string }>({
      query: ({ id }) => ({
        url: `leave/types/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LeaveType"],
    }),

    // --- Work Week config -----------------------------------------

    getWorkWeekConfig: builder.query<WorkWeekConfig, void>({
      query: () => "leave/config/work-week",
      providesTags: ["WorkWeek"],
    }),

    saveWorkWeekConfig: builder.mutation<WorkWeekConfig, WorkWeekConfig>({
      query: (body) => ({
        url: "leave/config/work-week",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["WorkWeek"],
    }),

    // --- Holidays --------------------------------------------------

    getHolidays: builder.query<Holiday[], HolidayFilters | void>({
      query: (filters) => {
        if (!filters) return "leave/holidays";
        const params: any = {};
        if (filters.from) params.from = filters.from;
        if (filters.to) params.to = filters.to;
        return { url: "leave/holidays", params };
      },
      providesTags: ["Holiday"],
    }),

    createHoliday: builder.mutation<
      Holiday,
      {
        name: string;
        date: string;
        isHalfDay: boolean;
        repeatsAnnually: boolean;
      }
    >({
      query: (body) => ({
        url: "leave/holidays",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Holiday"],
    }),

    deleteHoliday: builder.mutation<{ message: string }, { id: string }>({
      query: ({ id }) => ({
        url: `leave/holidays/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Holiday"],
    }),
  }),
});

export const {
  useGetLeaveTypesQuery,
  useApplyLeaveMutation,
  useGetMyLeavesQuery,
  useGetAllLeavesQuery,
  useUpdateLeaveStatusMutation,
  useAssignLeaveMutation,
  useCreateLeaveTypeMutation,
  useDeleteLeaveTypeMutation,
  useGetWorkWeekConfigQuery,
  useSaveWorkWeekConfigMutation,
  useGetHolidaysQuery,
  useCreateHolidayMutation,
  useDeleteHolidayMutation,
  useGetLeaveByIdQuery,
} = leaveApi;
