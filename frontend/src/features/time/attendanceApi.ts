import { createApi } from "@reduxjs/toolkit/query/react";
import { authedBaseQuery } from "../apiBase";

export type PunchType = "IN" | "OUT";

export interface AttendancePunch {
  _id: string;
  type: PunchType;
  at: string; // ISO
  note?: string;
}

export interface TodayAttendanceResponse {
  date: string; // YYYY-MM-DD
  punches: AttendancePunch[];
  status: "IN" | "OUT";
  lastPunchAt: string | null;
}

export interface WeekDaySummary {
  day: string; // Mon..Sun
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  status: "IN" | "OUT";
}

export interface WeekSummaryResponse {
  week: WeekDaySummary[];
}

export interface PunchPayload {
  date: string; // YYYY-MM-DD
  time: string; // "03:37 PM"
  note?: string;
  tzOffsetMinutes?: number; // optional
}

export interface AttendanceRecordRow {
  punchInAt: string; // ISO
  punchInNote?: string;
  punchOutAt?: string | null; // ISO or null if not punched out
  punchOutNote?: string;
  durationHours: number; // e.g. 0.02
  tzLabel?: string; // e.g. "GMT +05:30" (optional)
}

export interface AttendanceRecordsResponse {
  date: string; // YYYY-MM-DD
  totalDurationHours: number;
  count: number;
  rows: AttendanceRecordRow[];
}

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",
  baseQuery: authedBaseQuery,
  tagTypes: ["AttendanceToday", "AttendanceWeek"],
  endpoints: (builder) => ({
    // Today status (needed to decide Punch In vs Punch Out)
    getMyTodayAttendance: builder.query<TodayAttendanceResponse, void>({
      query: () => "time/attendance/me/today",
      providesTags: ["AttendanceToday"],
    }),

    // Week summary (optional: for dashboard widget)
    getMyWeekSummary: builder.query<WeekSummaryResponse, void>({
      query: () => "time/attendance/me/week-summary",
      providesTags: ["AttendanceWeek"],
    }),

    // Punch In
    punchIn: builder.mutation<{ punch: AttendancePunch }, PunchPayload>({
      query: (body) => ({
        url: "time/attendance/punch-in",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AttendanceToday", "AttendanceWeek"],
    }),

    // Punch Out
    punchOut: builder.mutation<{ punch: AttendancePunch }, PunchPayload>({
      query: (body) => ({
        url: "time/attendance/punch-out",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AttendanceToday", "AttendanceWeek"],
    }),

    getMyAttendanceRecordsByDate: builder.query<
      AttendanceRecordsResponse,
      string
    >({
      // date: "YYYY-MM-DD"
      query: (date) =>
        `time/attendance/me/records?date=${encodeURIComponent(date)}`,
      providesTags: ["AttendanceWeek"], // or create a new tag if you want
    }),
  }),
});

export const {
  useGetMyTodayAttendanceQuery,
  useGetMyWeekSummaryQuery,
  usePunchInMutation,
  usePunchOutMutation,
  useGetMyAttendanceRecordsByDateQuery,
} = attendanceApi;
