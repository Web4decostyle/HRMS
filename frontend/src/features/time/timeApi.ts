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
    getMyTimesheets: builder.query<Timesheet[], void>({
      query: () => "time/timesheets/my",
      providesTags: ["Timesheet"],
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
    getAllTimesheets: builder.query<Timesheet[], void>({
      query: () => "time/timesheets",
      providesTags: ["Timesheet"],
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
      invalidatesTags: ["Timesheet"],
    }),

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
  useGetMyTimesheetsQuery,
  useCreateTimesheetMutation,
  useGetAllTimesheetsQuery,
  useUpdateTimesheetStatusMutation,
  useClockInMutation,
  useClockOutMutation,
  useGetMyAttendanceQuery,
  useGetAllAttendanceQuery,
} = timeApi;
