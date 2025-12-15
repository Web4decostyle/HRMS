import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

export interface SystemInfo {
  nodeVersion: string;
  platform: string;
  uptimeSeconds: number;
  memoryUsage: any;
}

export interface HintItem {
  id: string;
  label: string;
}

export const maintenanceApi = createApi({
  reducerPath: "maintenanceApi",
  baseQuery: authorizedBaseQuery,
  endpoints: (builder) => ({
    verifyMaintenance: builder.mutation<
      { maintenanceToken: string },
      { password: string; scope: string }
    >({
      query: (body) => ({
        url: "maintenance/verify",
        method: "POST",
        body,
      }),
    }),

    getSystemInfo: builder.query<SystemInfo, { maintenanceToken: string }>({
      query: ({ maintenanceToken }) => ({
        url: "maintenance/system-info",
        method: "GET",
        headers: { "x-maintenance-token": maintenanceToken },
      }),
    }),

    // ✅ Typeahead: employee name hints
    employeeHints: builder.query<
      HintItem[],
      { q: string; maintenanceToken: string }
    >({
      query: ({ q, maintenanceToken }) => ({
        url: `maintenance/hints/employees?q=${encodeURIComponent(q)}`,
        method: "GET",
        headers: { "x-maintenance-token": maintenanceToken },
      }),
    }),

    // ✅ Typeahead: vacancy hints (for Purge Candidate Records)
    vacancyHints: builder.query<
      HintItem[],
      { q: string; maintenanceToken: string }
    >({
      query: ({ q, maintenanceToken }) => ({
        url: `maintenance/hints/vacancies?q=${encodeURIComponent(q)}`,
        method: "GET",
        headers: { "x-maintenance-token": maintenanceToken },
      }),
    }),
  }),
});

export const {
  useVerifyMaintenanceMutation,
  useGetSystemInfoQuery,
  useEmployeeHintsQuery,
  useVacancyHintsQuery,
} = maintenanceApi;
