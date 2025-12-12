// frontend/src/features/pim/pimConfigApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

/** ---- Types ---- */
export interface PimOptionalFields {
  showNickname: boolean;
  showSmoker: boolean;
  showMilitaryService: boolean;
  showSSN: boolean;
  showSIN: boolean;
  showUSTaxExemptions: boolean;
}

export type PimScreen =
  | "personal"
  | "contact"
  | "emergency"
  | "dependents"
  | "immigration"
  | "job"
  | "salary"
  | "report_to"
  | "qualifications"
  | "membership"
  | string;

export type CustomFieldType = "text" | "dropdown";

export interface PimCustomField {
  _id: string;
  fieldName: string;
  screen: PimScreen;
  type: CustomFieldType;
  dropdownOptions?: string[];
  required: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportingMethod {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TerminationReason {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TerminationReasonListResponse {
  items: TerminationReason[];
  total: number;
}

/** Import endpoint response types */
export type ImportRowResult = {
  row: number;
  status: "success" | "error";
  errors?: string[];
  data?: Record<string, any>;
};

export type ImportSummary = {
  total: number;
  success: number;
  failed: number;
};

export interface UploadImportResponse {
  success: boolean;
  message?: string;
  summary?: ImportSummary;
  results?: ImportRowResult[];
  parseErrors?: string[];
}

/** ---- API ---- */
export const pimConfigApi = createApi({
  reducerPath: "pimConfigApi",
  baseQuery: authorizedBaseQuery,
  tagTypes: [
    "PimSettings",
    "PimCustomFields",
    "ReportingMethods",
    "TerminationReason",
  ],
  endpoints: (builder) => ({
    // Optional: screens (server may or may not implement)
    getPimScreens: builder.query<PimScreen[], void>({
      query: () => "/pim/screens",
    }),

    /* ================== OPTIONAL FIELDS ================== */
    getOptionalFields: builder.query<
      { success: boolean; data: PimOptionalFields },
      void
    >({
      query: () => "/pim-config/optional-fields",
      providesTags: ["PimSettings"],
    }),

    updateOptionalFields: builder.mutation<
      { success: boolean; data: PimOptionalFields },
      PimOptionalFields
    >({
      query: (body) => ({
        url: "/pim-config/optional-fields",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["PimSettings"],
    }),

    /* ================== REPORTING METHODS ================== */
    getReportingMethods: builder.query<
      { success: boolean; data: ReportingMethod[] },
      void
    >({
      query: () => "/pim-config/reporting-methods",
      providesTags: ["ReportingMethods"],
    }),

    createReportingMethod: builder.mutation<
      { success: boolean; data: ReportingMethod },
      { name: string }
    >({
      query: (body) => ({
        url: "/pim-config/reporting-methods",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ReportingMethods"],
    }),

    deleteReportingMethod: builder.mutation<
      { success: boolean; message?: string },
      string
    >({
      query: (id) => ({
        url: `/pim-config/reporting-methods/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ReportingMethods"],
    }),

    /* ================== CUSTOM FIELDS ================== */
    getCustomFields: builder.query<
      { success: boolean; data: PimCustomField[] },
      void
    >({
      query: () => "/pim-config/custom-fields",
      providesTags: ["PimCustomFields"],
    }),

    createCustomField: builder.mutation<
      { success: boolean; data: PimCustomField },
      {
        fieldName: string;
        screen: PimScreen;
        type: CustomFieldType;
        dropdownOptions?: string[];
        required?: boolean;
      }
    >({
      query: (data) => ({
        url: "/pim-config/custom-fields",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PimCustomFields"],
    }),

    deleteCustomField: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/pim-config/custom-fields/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PimCustomFields"],
    }),

    /* ================== TERMINATION REASONS ================== */
    getTerminationReasons: builder.query<TerminationReasonListResponse, void>({
      query: () => "/pim-config/termination-reasons",
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((r) => ({
                type: "TerminationReason" as const,
                id: r._id,
              })),
              { type: "TerminationReason" as const, id: "LIST" },
            ]
          : [{ type: "TerminationReason" as const, id: "LIST" }],
    }),

    createTerminationReason: builder.mutation<any, { name: string }>({
      query: (body) => ({
        url: "/pim-config/termination-reasons",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "TerminationReason", id: "LIST" }],
    }),

    updateTerminationReason: builder.mutation<
      any,
      { id: string; name: string }
    >({
      query: ({ id, name }) => ({
        url: `/pim-config/termination-reasons/${id}`,
        method: "PUT",
        body: { name },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "TerminationReason", id: arg.id },
        { type: "TerminationReason", id: "LIST" },
      ],
    }),

    deleteTerminationReason: builder.mutation<any, string>({
      query: (id) => ({
        url: `/pim-config/termination-reasons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "TerminationReason", id },
        { type: "TerminationReason", id: "LIST" },
      ],
    }),

    /* ================== IMPORT (CSV upload) ================== */
    uploadImport: builder.mutation<UploadImportResponse, FormData>({
      query: (formData) => ({
        url: "/pim/import",
        method: "POST",
        body: formData,
        // ensure we accept JSON; DO NOT set Content-Type so browser can set multipart boundary
        headers: { Accept: "application/json" },
      }),
      invalidatesTags: ["PimSettings"],
    }),
  }),
});

/* ====== Export hooks ====== */
export const {
  useGetPimScreensQuery,
  useGetOptionalFieldsQuery,
  useUpdateOptionalFieldsMutation,
  useGetCustomFieldsQuery,
  useCreateCustomFieldMutation,
  useDeleteCustomFieldMutation,
  useUploadImportMutation,
  useGetReportingMethodsQuery,
  useCreateReportingMethodMutation,
  useDeleteReportingMethodMutation,
  useGetTerminationReasonsQuery,
  useCreateTerminationReasonMutation,
  useUpdateTerminationReasonMutation,
  useDeleteTerminationReasonMutation,
} = pimConfigApi;
