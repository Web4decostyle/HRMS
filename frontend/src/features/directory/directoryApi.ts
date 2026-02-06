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

  // division can be ObjectId OR populated
  division?: string | { _id: string; name: string };

  // ✅ NEW: subDivision can be ObjectId OR populated
  subDivision?: string | { _id: string; name: string };
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

export interface DivisionSummaryRow {
  divisionId: string;
  divisionName: string;
  count: number;
}

export const directoryApi = createApi({
  reducerPath: "directoryApi",
  baseQuery: authorizedBaseQuery,
  endpoints: (builder) => ({
    /**
     * ✅ UPDATED: supports subDivisionId too
     * Backend should accept: q, location, jobTitle, divisionId, subDivisionId
     */
    searchEmployees: builder.query<
      DirectoryEmployee[],
      | {
          q?: string;
          location?: string;
          jobTitle?: string;
          divisionId?: string;
          subDivisionId?: string;
        }
      | void
    >({
      query: (params) => {
        const sp = new URLSearchParams();
        if (params?.q) sp.set("q", params.q);
        if (params?.location) sp.set("location", params.location);
        if (params?.jobTitle) sp.set("jobTitle", params.jobTitle);
        if (params?.divisionId) sp.set("divisionId", params.divisionId);
        if (params?.subDivisionId) sp.set("subDivisionId", params.subDivisionId);

        const qs = sp.toString();
        return qs ? `directory/employees?${qs}` : "directory/employees";
      },
    }),

    getHierarchy: builder.query<HierarchyResponse, string>({
      query: (employeeId) => `directory/hierarchy/${employeeId}`,
    }),

    /**
     * ✅ Division summary endpoint
     * GET /api/directory/divisions-summary?location=&jobTitle=
     */
    getDivisionsSummary: builder.query<
      DivisionSummaryRow[],
      { location?: string; jobTitle?: string } | void
    >({
      query: (params) => {
        const sp = new URLSearchParams();
        if (params?.location) sp.set("location", params.location);
        if (params?.jobTitle) sp.set("jobTitle", params.jobTitle);
        const qs = sp.toString();
        return qs
          ? `directory/divisions-summary?${qs}`
          : "directory/divisions-summary";
      },
    }),
  }),
});

export const {
  useSearchEmployeesQuery,
  useGetHierarchyQuery,
  useGetDivisionsSummaryQuery,
} = directoryApi;
