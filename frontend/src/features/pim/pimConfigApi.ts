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
    // (Optional) if you want enum screens from backend later
    getPimScreens: builder.query<PimScreen[], void>({
      query: () => "/pim/screens",
    }),

    /* ================== OPTIONAL FIELDS ================== */
    // GET /api/pim-config/optional-fields
    getOptionalFields: builder.query<
      { success: boolean; data: PimOptionalFields },
      void
    >({
      query: () => "/pim-config/optional-fields",
      providesTags: ["PimSettings"],
    }),

    // PUT /api/pim-config/optional-fields
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
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/pim-config/reporting-methods/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ReportingMethods"],
    }),

    /* ================== CUSTOM FIELDS ================== */
    // GET /api/pim-config/custom-fields
    getCustomFields: builder.query<
      { success: boolean; data: PimCustomField[] },
      void
    >({
      query: () => "/pim-config/custom-fields",
      providesTags: ["PimCustomFields"],
    }),

    // POST /api/pim-config/custom-fields
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

    // DELETE /api/pim-config/custom-fields/:id
    deleteCustomField: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/pim-config/custom-fields/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PimCustomFields"],
    }),

    /* ================== TERMINATION REASONS ================== */
    // GET /api/pim-config/termination-reasons
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

    // POST /api/pim-config/termination-reasons
    createTerminationReason: builder.mutation<
      any,
      { name: string }
    >({
      query: (body) => ({
        url: "/pim-config/termination-reasons",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "TerminationReason", id: "LIST" }],
    }),

    // PUT /api/pim-config/termination-reasons/:id
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

    // DELETE /api/pim-config/termination-reasons/:id
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

    /* ================== IMPORT (if used) ================== */
    // POST /pim/import  (CSV upload)
    uploadImport: builder.mutation<
      { success: boolean; message?: string },
      FormData
    >({
      query: (formData) => ({
        url: "/pim/import",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

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

  // NEW:
  useGetTerminationReasonsQuery,
  useCreateTerminationReasonMutation,
  useUpdateTerminationReasonMutation,
  useDeleteTerminationReasonMutation,
} = pimConfigApi;
