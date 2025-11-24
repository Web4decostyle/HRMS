// frontend/src/features/qualifications/qualificationApiSlice.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

/* ---------- Types (optional but nice) ---------- */

export interface Education {
  _id: string;
  level: string;
}

export interface License {
  _id: string;
  name: string;
  description?: string;
}

export interface Language {
  _id: string;
  name: string;
  fluency: "Writing" | "Speaking" | "Reading";
  competency: "Poor" | "Good" | "Excellent";
}

export interface Membership {
  _id: string;
  name: string;
}

/* ---------- API Slice ---------- */

export const qualificationApiSlice = createApi({
  reducerPath: "qualificationApi",
  baseQuery: authorizedBaseQuery,
  tagTypes: ["Education", "Licenses", "Languages", "Memberships"],
  endpoints: (builder) => ({
    // EDUCATION
    getEducation: builder.query<Education[], void>({
      query: () => "/qualifications/education",
      providesTags: ["Education"],
    }),
    createEducation: builder.mutation<Education, { level: string }>({
      query: (body) => ({
        url: "/qualifications/education",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Education"],
    }),
    deleteEducation: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/qualifications/education/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Education"],
    }),

    // LICENSES
    getLicenses: builder.query<License[], void>({
      query: () => "/qualifications/licenses",
      providesTags: ["Licenses"],
    }),
    createLicense: builder.mutation<
      License,
      { name: string; description?: string }
    >({
      query: (body) => ({
        url: "/qualifications/licenses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Licenses"],
    }),
    deleteLicense: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/qualifications/licenses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Licenses"],
    }),

    // LANGUAGES
    getLanguages: builder.query<Language[], void>({
      query: () => "/qualifications/languages",
      providesTags: ["Languages"],
    }),
    createLanguage: builder.mutation<
      Language,
      { name: string; fluency: string; competency: string }
    >({
      query: (body) => ({
        url: "/qualifications/languages",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Languages"],
    }),
    deleteLanguage: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/qualifications/languages/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Languages"],
    }),

  }),
});

export const {
  useGetEducationQuery,
  useCreateEducationMutation,
  useDeleteEducationMutation,
  useGetLicensesQuery,
  useCreateLicenseMutation,
  useDeleteLicenseMutation,
  useGetLanguagesQuery,
  useCreateLanguageMutation,
  useDeleteLanguageMutation,
} = qualificationApiSlice;
