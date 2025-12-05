// frontend/src/features/pim/pimReportsApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

export interface PimReportDisplayGroup {
  groupKey: string;           // e.g. "personal"
  includeHeader: boolean;
  fields: string[];           // field keys
}

export type IncludeFilter = "CURRENT_ONLY" | "CURRENT_AND_PAST";

export interface PimReport {
  _id: string;
  name: string;
  include: IncludeFilter;
  selectionCriteria: string[];
  displayGroups: PimReportDisplayGroup[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePimReportInput {
  name: string;
  include: IncludeFilter;
  selectionCriteria: string[];
  displayGroups: PimReportDisplayGroup[];
}

export const pimReportsApi = createApi({
  reducerPath: "pimReportsApi",
  baseQuery: authorizedBaseQuery,
  tagTypes: ["PimReports"],
  endpoints: (builder) => ({
    // GET /api/pim/reports?q=...
    getPimReports: builder.query<PimReport[], { q?: string } | void>({
      query: (params) =>
        params?.q
          ? `/pim/reports?q=${encodeURIComponent(params.q)}`
          : "/pim/reports",
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({
                type: "PimReports" as const,
                id: r._id,
              })),
              { type: "PimReports" as const, id: "LIST" },
            ]
          : [{ type: "PimReports" as const, id: "LIST" }],
    }),

    // GET /api/pim/reports/:id
    getPimReport: builder.query<PimReport, string>({
      query: (id) => `/pim/reports/${id}`,
      providesTags: (result, error, id) => [{ type: "PimReports", id }],
    }),

    // POST /api/pim/reports
    createPimReport: builder.mutation<PimReport, CreatePimReportInput>({
      query: (body) => ({
        url: "/pim/reports",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "PimReports", id: "LIST" }],
    }),

    // PUT /api/pim/reports/:id
    updatePimReport: builder.mutation<
      PimReport,
      { id: string; data: CreatePimReportInput }
    >({
      query: ({ id, data }) => ({
        url: `/pim/reports/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "PimReports", id: arg.id },
        { type: "PimReports", id: "LIST" },
      ],
    }),

    // DELETE /api/pim/reports/:id
    deletePimReport: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/pim/reports/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "PimReports", id },
        { type: "PimReports", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPimReportsQuery,
  useGetPimReportQuery,
  useCreatePimReportMutation,
  useUpdatePimReportMutation,
  useDeletePimReportMutation,
} = pimReportsApi;
