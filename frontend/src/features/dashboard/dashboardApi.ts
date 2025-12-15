// frontend/src/features/dashboard/dashboardApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

export type TimeAtWork = {
  status: "PUNCHED_IN" | "PUNCHED_OUT";
  punchedAt?: string; // ISO string
  todaySeconds: number;
  week: { label: string; seconds: number }[]; // Mon..Sun
};

export type MyActions = {
  pendingLeaveApprovals: number;
  pendingTimesheets: number;
  pendingClaims: number;
};

export type EmployeesOnLeave = {
  total: number;
};

export type DistributionItem = {
  label: string;
  value: number;
};

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: authorizedBaseQuery,
  endpoints: (builder) => ({
    getTimeAtWork: builder.query<TimeAtWork, void>({
      query: () => "dashboard/time-at-work",
    }),
    getMyActions: builder.query<MyActions, void>({
      query: () => "dashboard/my-actions",
    }),
    getEmployeesOnLeaveToday: builder.query<EmployeesOnLeave, void>({
      query: () => "dashboard/employees-on-leave-today",
    }),
    getSubunitDistribution: builder.query<DistributionItem[], void>({
      query: () => "dashboard/distribution/subunit",
    }),
    getLocationDistribution: builder.query<DistributionItem[], void>({
      query: () => "dashboard/distribution/location",
    }),
  }),
});

export const {
  useGetTimeAtWorkQuery,
  useGetMyActionsQuery,
  useGetEmployeesOnLeaveTodayQuery,
  useGetSubunitDistributionQuery,
  useGetLocationDistributionQuery,
} = dashboardApi;
