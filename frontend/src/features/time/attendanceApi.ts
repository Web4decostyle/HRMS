// frontend/src/features/time/attendanceApi.ts
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
  date: string; // YYYY-MM-DD
  totalMinutes: number;
}
export interface WeekSummaryResponse {
  week: WeekDaySummary[];
}

export interface PunchPayload {
  date: string; // YYYY-MM-DD
  time: string; // "03:37 PM" OR "HH:MM"
  note?: string;
  tzOffsetMinutes?: number;
}

export interface AttendanceRecordRow {
  punchInAt: string; // ISO
  punchInNote?: string;
  punchOutAt?: string | null; // ISO or null
  punchOutNote?: string;
  durationMinutes: number;
  tzLabel?: string;
}

export interface AttendanceRecordsResponse {
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  count: number;
  rows: AttendanceRecordRow[];
}

export type MonthDaySummary = {
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  firstInAt: string | null;
  lastOutAt: string | null;
};

export interface MonthSummaryResponse {
  from: string;
  to: string;
  tzLabel: string;
  days: MonthDaySummary[];
}

export type CsvImportRow = {
  date: string; // YYYY-MM-DD
  inTime: string; // "09:30" or "03:37 PM"
  outTime?: string;
  note?: string;
};

function tzOffsetAheadMinutes() {
  return -new Date().getTimezoneOffset();
}

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",
  baseQuery: authedBaseQuery,
  tagTypes: ["AttendanceToday", "AttendanceWeek", "AttendanceDay", "AttendanceMonth"],
  endpoints: (builder) => ({
    // ✅ This produces hook: useGetMyTodayAttendanceQuery ✅
    getMyTodayAttendance: builder.query<TodayAttendanceResponse, void>({
      query: () => `time/attendance/me/today?tzOffsetMinutes=${tzOffsetAheadMinutes()}`,
      providesTags: ["AttendanceToday"],
    }),

    // ✅ week endpoint: /me/week
    getMyWeekSummary: builder.query<WeekSummaryResponse, void>({
      query: () => `time/attendance/me/week?tzOffsetMinutes=${tzOffsetAheadMinutes()}`,
      providesTags: ["AttendanceWeek"],
    }),

    punchIn: builder.mutation<any, PunchPayload>({
      query: (body) => ({
        url: "time/attendance/punch-in",
        method: "POST",
        body: { ...body, tzOffsetMinutes: tzOffsetAheadMinutes() },
      }),
      invalidatesTags: ["AttendanceToday", "AttendanceWeek", "AttendanceDay", "AttendanceMonth"],
    }),

    punchOut: builder.mutation<any, PunchPayload>({
      query: (body) => ({
        url: "time/attendance/punch-out",
        method: "POST",
        body: { ...body, tzOffsetMinutes: tzOffsetAheadMinutes() },
      }),
      invalidatesTags: ["AttendanceToday", "AttendanceWeek", "AttendanceDay", "AttendanceMonth"],
    }),

    getMyAttendanceRecordsByDate: builder.query<AttendanceRecordsResponse, string>({
      query: (date) =>
        `time/attendance/me/records?date=${encodeURIComponent(date)}&tzOffsetMinutes=${tzOffsetAheadMinutes()}`,
      providesTags: (_r, _e, date) => [{ type: "AttendanceDay", id: date }],
    }),

    // ✅ Month summary
    getMyMonthSummary: builder.query<MonthSummaryResponse, { from: string; to: string }>({
      query: ({ from, to }) =>
        `time/attendance/me/month?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&tzOffsetMinutes=${tzOffsetAheadMinutes()}`,
      providesTags: ["AttendanceMonth"],
    }),

    // ✅ CSV import
    importMyAttendanceCsv: builder.mutation<
      { message: string; accepted: number; rejected: number },
      { rows: CsvImportRow[] }
    >({
      query: (body) => ({
        url: "time/attendance/me/import-csv",
        method: "POST",
        body: { ...body, tzOffsetMinutes: tzOffsetAheadMinutes() },
      }),
      invalidatesTags: ["AttendanceMonth", "AttendanceWeek", "AttendanceDay", "AttendanceToday"],
    }),
  }),
});

export const {
  useGetMyTodayAttendanceQuery, // ✅ Fixes your error
  useGetMyWeekSummaryQuery,
  usePunchInMutation,
  usePunchOutMutation,
  useGetMyAttendanceRecordsByDateQuery,
  useGetMyMonthSummaryQuery,
  useImportMyAttendanceCsvMutation,
} = attendanceApi;
