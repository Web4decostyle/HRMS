// frontend/src/features/admin/adminApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authedBaseQuery } from "../apiBase";

export interface OrgUnit {
  _id: string;
  name: string;
  code?: string;
  parent?: string;
}

export interface JobTitle {
  _id: string;
  name: string;
  code?: string;
  description?: string;
}

export interface PayGrade {
  _id: string;
  name: string;
  currency?: string;
  minSalary?: number;
  maxSalary?: number;
}

export interface Location {
  _id: string;
  name: string;
  city?: string;
  country?: string;
  address?: string;
}

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: authedBaseQuery,
  tagTypes: ["OrgUnit", "JobTitle", "PayGrade", "Location"],
  endpoints: (builder) => ({
    getOrgUnits: builder.query<OrgUnit[], void>({
      query: () => "admin/org-units",
      providesTags: ["OrgUnit"],
    }),
    createOrgUnit: builder.mutation<
      OrgUnit,
      { name: string; code?: string; parent?: string; description?: string }
    >({
      query: (body) => ({
        url: "admin/org-units",
        method: "POST",
        body,
      }),
      invalidatesTags: ["OrgUnit"],
    }),

    getJobTitles: builder.query<JobTitle[], void>({
      query: () => "admin/job-titles",
      providesTags: ["JobTitle"],
    }),
    createJobTitle: builder.mutation<
      JobTitle,
      { name: string; code?: string; description?: string }
    >({
      query: (body) => ({
        url: "admin/job-titles",
        method: "POST",
        body,
      }),
      invalidatesTags: ["JobTitle"],
    }),

    getPayGrades: builder.query<PayGrade[], void>({
      query: () => "admin/pay-grades",
      providesTags: ["PayGrade"],
    }),
    createPayGrade: builder.mutation<
      PayGrade,
      { name: string; currency?: string; minSalary?: number; maxSalary?: number }
    >({
      query: (body) => ({
        url: "admin/pay-grades",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PayGrade"],
    }),

    getLocations: builder.query<Location[], void>({
      query: () => "admin/locations",
      providesTags: ["Location"],
    }),
    createLocation: builder.mutation<
      Location,
      { name: string; city?: string; country?: string; address?: string }
    >({
      query: (body) => ({
        url: "admin/locations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Location"],
    }),
  }),
});

export const {
  useGetOrgUnitsQuery,
  useCreateOrgUnitMutation,
  useGetJobTitlesQuery,
  useCreateJobTitleMutation,
  useGetPayGradesQuery,
  useCreatePayGradeMutation,
  useGetLocationsQuery,
  useCreateLocationMutation,
} = adminApi;
