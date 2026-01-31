// frontend/src/features/directory/directoryApi.ts
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

  // ✅ NEW: division (can be ObjectId string OR populated object)
  division?: string | { _id: string; name: string };
}

export interface HierarchyResponse {
  employee: DirectoryEmployee;

  // NOTE: Keep these shapes if your backend already returns this.
  // If you later change backend to return division-based chain, we can update UI accordingly.
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
     * ✅ Updated: filter by divisionId instead of department
     * Backend should accept: q, location, jobTitle, divisionId
     */
    searchEmployees: builder.query<
      DirectoryEmployee[],
      { q?: string; location?: string; jobTitle?: string; divisionId?: string } | void
    >({
      query: (params) => {
        const sp = new URLSearchParams();
        if (params?.q) sp.set("q", params.q);
        if (params?.location) sp.set("location", params.location);
        if (params?.jobTitle) sp.set("jobTitle", params.jobTitle);
        if (params?.divisionId) sp.set("divisionId", params.divisionId);

        const qs = sp.toString();
        return qs ? `directory/employees?${qs}` : "directory/employees";
      },
    }),

    getHierarchy: builder.query<HierarchyResponse, string>({
      query: (employeeId) => `directory/hierarchy/${employeeId}`,
    }),

    /**
     * ✅ NEW: Division summary endpoint
     * Backend should implement:
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
