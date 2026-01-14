import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

export interface DirectoryEmployee {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  location?: string;
  department?: string;
}

export interface HierarchyResponse {
  employee: DirectoryEmployee;
  supervisors: Array<{
    _id: string;
    reportingMethod?: string;
    supervisorId: DirectoryEmployee;
  }>;
  subordinates: Array<{
    _id: string;
    reportingMethod?: string;
    subordinateId: DirectoryEmployee;
  }>;
}

export interface DepartmentSummaryRow {
  department: string;
  count: number;
}

export const directoryApi = createApi({
  reducerPath: "directoryApi",
  baseQuery: authorizedBaseQuery,
  endpoints: (builder) => ({
    searchEmployees: builder.query<
      DirectoryEmployee[],
      { q?: string; location?: string; jobTitle?: string; department?: string } | void
    >({
      query: (params) => {
        const sp = new URLSearchParams();
        if (params?.q) sp.set("q", params.q);
        if (params?.location) sp.set("location", params.location);
        if (params?.jobTitle) sp.set("jobTitle", params.jobTitle);
        if (params?.department) sp.set("department", params.department);
        const qs = sp.toString();
        return qs ? `directory/employees?${qs}` : "directory/employees";
      },
    }),

    getHierarchy: builder.query<HierarchyResponse, string>({
      query: (employeeId) => `directory/hierarchy/${employeeId}`,
    }),

    // ✅ NEW
    getDepartmentsSummary: builder.query<
      DepartmentSummaryRow[],
      { location?: string; jobTitle?: string } | void
    >({
      query: (params) => {
        const sp = new URLSearchParams();
        if (params?.location) sp.set("location", params.location);
        if (params?.jobTitle) sp.set("jobTitle", params.jobTitle);
        const qs = sp.toString();
        return qs
          ? `directory/departments-summary?${qs}`
          : "directory/departments-summary";
      },
    }),
  }),
});

export const {
  useSearchEmployeesQuery,
  useGetHierarchyQuery,
  useGetDepartmentsSummaryQuery,
} = directoryApi;
