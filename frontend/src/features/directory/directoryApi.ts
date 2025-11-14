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
}

export const directoryApi = createApi({
  reducerPath: "directoryApi",
  baseQuery: authorizedBaseQuery,
  endpoints: (builder) => ({
    searchEmployees: builder.query<
      DirectoryEmployee[],
      { q?: string; location?: string; jobTitle?: string } | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.q) searchParams.set("q", params.q);
        if (params?.location) searchParams.set("location", params.location);
        if (params?.jobTitle) searchParams.set("jobTitle", params.jobTitle);
        const qs = searchParams.toString();
        return qs ? `directory/employees?${qs}` : "directory/employees";
      },
    }),
  }),
});

export const { useSearchEmployeesQuery } = directoryApi;
