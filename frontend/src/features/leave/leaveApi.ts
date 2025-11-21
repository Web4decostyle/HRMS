// frontend/src/features/leave/leaveApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type WorkDayKind = "FULL" | "HALF" | "NONE";

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

/* ------------ Entitlements types ------------ */

export interface LeaveEntitlement {
  _id: string;
  employee:
    | string
    | {
        _id: string;
        employeeId?: string;
        firstName?: string;
        lastName?: string;
      };
  leaveType:
    | string
    | {
        _id: string;
        name: string;
      };
  periodStart: string;
  periodEnd: string;
  days: number;
}

export interface LeaveEntitlementFilters {
  employeeId?: string;
  leaveTypeId?: string;
  periodStart?: string; // ISO date
  periodEnd?: string; // ISO date
}

export interface AddLeaveEntitlementPayload {
  employeeId: string;
  leaveTypeId: string;
  periodStart: string;
  periodEnd: string;
  days: number;
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
  // 🔥 add LeaveEntitlement here
  tagTypes: ["LeaveType", "LeaveRequest", "LeaveEntitlement", "WorkWeek", "Holiday"],
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
      { name: string; date: string; isHalfDay: boolean; repeatsAnnually: boolean }
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

    /* ------------ Entitlements endpoints ------------ */

    getLeaveEntitlements: builder.query<
      LeaveEntitlement[],
      LeaveEntitlementFilters | void
    >({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.employeeId)
          params.append("employeeId", filters.employeeId);
        if (filters?.leaveTypeId)
          params.append("leaveTypeId", filters.leaveTypeId);
        if (filters?.periodStart)
          params.append("periodStart", filters.periodStart);
        if (filters?.periodEnd) params.append("periodEnd", filters.periodEnd);

        const qs = params.toString();
        return {
          url: `/leave-entitlements${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["LeaveEntitlement"],
    }),

    getMyLeaveEntitlements: builder.query<LeaveEntitlement[], void>({
      query: () => ({
        url: "/leave-entitlements/my",
        method: "GET",
      }),
      providesTags: ["LeaveEntitlement"],
    }),

    addLeaveEntitlement: builder.mutation<
      LeaveEntitlement,
      AddLeaveEntitlementPayload
    >({
      query: (body) => ({
        url: "/leave-entitlements",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LeaveEntitlement"],
    }),
  }),
});

export const {
  useGetLeaveTypesQuery,
  useApplyLeaveMutation,
  useGetMyLeavesQuery,
  useGetAllLeavesQuery,
  useUpdateLeaveStatusMutation,
  useGetLeaveEntitlementsQuery,
  useGetMyLeaveEntitlementsQuery,
  useAddLeaveEntitlementMutation,
  useAssignLeaveMutation,
  useCreateLeaveTypeMutation,
  useDeleteLeaveTypeMutation,
  useGetWorkWeekConfigQuery,
  useSaveWorkWeekConfigMutation,
  useGetHolidaysQuery,
  useCreateHolidayMutation,
  useDeleteHolidayMutation,
} = leaveApi;
