// frontend/src/features/maintenance/maintenanceApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

export interface SystemInfo {
  nodeVersion: string;
  platform: string;
  uptimeSeconds: number;
  memoryUsage: any;
}

export const maintenanceApi = createApi({
  reducerPath: "maintenanceApi",
  baseQuery: authorizedBaseQuery,
  endpoints: (builder) => ({
    getSystemInfo: builder.query<SystemInfo, void>({
      query: () => "maintenance/system-info",
    }),
  }),
});

export const { useGetSystemInfoQuery } = maintenanceApi;
