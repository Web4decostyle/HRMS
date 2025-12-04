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
  date: string;
  inTime: string;
  outTime?: string | null;
  status: "OPEN" | "CLOSED";
}

export const timeApi = createApi({
  reducerPath: "timeApi",
  baseQuery: authorizedBaseQuery,
  tagTypes: ["Timesheet", "Attendance"],
  endpoints: (builder) => ({
    // ----- TIMESHEETS LISTS -----
    getMyTimesheets: builder.query<Timesheet[], void>({
      query: () => "time/timesheets/my",
      // generic tag so all timesheet lists get invalidated together
      providesTags: ["Timesheet"],
    }),

    getAllTimesheets: builder.query<Timesheet[], void>({
      query: () => "time/timesheets",
      providesTags: ["Timesheet"],
    }),

    // ----- SINGLE TIMESHEET (for view/edit) -----
    getTimesheet: builder.query<Timesheet, string>({
      query: (id) => `time/timesheets/${id}`,
      // per-id tag so edits can invalidate this specific record
      providesTags: (result, error, id) => [{ type: "Timesheet", id }],
    }),

    // create new timesheet (period + initial entries)
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

    // update only the status (SUBMITTED, APPROVED, etc.)
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
          ? [
              { type: "Timesheet" as const, id: result._id },
              "Timesheet",
            ]
          : ["Timesheet"],
    }),

    // FULL entries update – used by Edit screen
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

    getMyAttendance: builder.query<AttendanceRecord[], void>({
      query: () => "time/attendance/my",
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
