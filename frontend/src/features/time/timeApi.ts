// frontend/src/features/time/timeApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

export interface TimesheetEntry {
  date: string;
  project?: string;
  task?: string;
  hours: number;
  comment?: string;
}

export interface Timesheet {
  _id: string;
  employee: any;
  periodStart: string;
  periodEnd: string;
  status: "OPEN" | "SUBMITTED" | "APPROVED" | "REJECTED";
  entries: TimesheetEntry[];
}

export interface AttendanceRecord {
  _id: string;
  employee: any;
  date: string; // ISO date stored as midnight
  inTime: string; // ISO datetime
  outTime?: string | null; // ISO datetime or null
  status: "OPEN" | "CLOSED";
}

export type AttendanceRangeArg =
  | void
  | {
      from?: string; // YYYY-MM-DD
      to?: string; // YYYY-MM-DD
    };

export const timeApi = createApi({
  reducerPath: "timeApi",
  baseQuery: authorizedBaseQuery,
  tagTypes: ["Timesheet", "Attendance"],
  endpoints: (builder) => ({
    // ----- TIMESHEETS LISTS -----
    getMyTimesheets: builder.query<Timesheet[], void>({
      query: () => "time/timesheets/my",
      providesTags: ["Timesheet"],
    }),

    getAllTimesheets: builder.query<Timesheet[], void>({
      query: () => "time/timesheets",
      providesTags: ["Timesheet"],
    }),

    // ----- SINGLE TIMESHEET -----
    getTimesheet: builder.query<Timesheet, string>({
      query: (id) => `time/timesheets/${id}`,
      providesTags: (result, error, id) => [{ type: "Timesheet", id }],
    }),

    createTimesheet: builder.mutation<
      Timesheet,
      { periodStart: string; periodEnd: string; entries: TimesheetEntry[] }
    >({
      query: (body) => ({
        url: "time/timesheets",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Timesheet"],
    }),

    updateTimesheetStatus: builder.mutation<
      Timesheet,
      { id: string; status: Timesheet["status"] }
    >({
      query: ({ id, status }) => ({
        url: `time/timesheets/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result) =>
        result
          ? [{ type: "Timesheet" as const, id: result._id }, "Timesheet"]
          : ["Timesheet"],
    }),

    updateTimesheetEntries: builder.mutation<
      Timesheet,
      { id: string; entries: TimesheetEntry[] }
    >({
      query: ({ id, entries }) => ({
        url: `time/timesheets/${id}`,
        method: "PUT",
        body: { entries },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Timesheet" as const, id },
        "Timesheet",
      ],
    }),

    // ----- ATTENDANCE -----
    clockIn: builder.mutation<AttendanceRecord, void>({
      query: () => ({
        url: "time/attendance/clock-in",
        method: "POST",
      }),
      invalidatesTags: ["Attendance"],
    }),

    clockOut: builder.mutation<AttendanceRecord, void>({
      query: () => ({
        url: "time/attendance/clock-out",
        method: "POST",
      }),
      invalidatesTags: ["Attendance"],
    }),

    // ✅ UPDATED: supports optional range
    getMyAttendance: builder.query<AttendanceRecord[], AttendanceRangeArg>({
      query: (arg) => {
        const from = (arg as any)?.from;
        const to = (arg as any)?.to;

        const params = new URLSearchParams();
        if (from) params.set("from", from);
        if (to) params.set("to", to);

        const qs = params.toString();
        return qs ? `time/attendance/my?${qs}` : "time/attendance/my";
      },
      providesTags: ["Attendance"],
    }),

    getAllAttendance: builder.query<AttendanceRecord[], void>({
      query: () => "time/attendance",
      providesTags: ["Attendance"],
    }),
  }),
});

export const {
  // timesheets
  useGetMyTimesheetsQuery,
  useGetAllTimesheetsQuery,
  useGetTimesheetQuery,
  useCreateTimesheetMutation,
  useUpdateTimesheetStatusMutation,
  useUpdateTimesheetEntriesMutation,
  // attendance
  useClockInMutation,
  useClockOutMutation,
  useGetMyAttendanceQuery,
  useGetAllAttendanceQuery,
} = timeApi;
