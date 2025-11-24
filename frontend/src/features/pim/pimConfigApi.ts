import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

/** ---- Types (adjust if you want stricter typing) ---- */
export interface PimOptionalFields {
  showNickName?: boolean;
  showSmoker?: boolean;
  showMilitaryService?: boolean;
  showSsn?: boolean;
  showSin?: boolean;
  showTaxMenu?: boolean;
}

export type PimScreen =
  | "PERSONAL_DETAILS"
  | "CONTACT_DETAILS"
  | "EMERGENCY_CONTACTS"
  | "DEPENDENTS"
  | "IMMIGRATION"
  | "JOB"
  | "SALARY"
  | "REPORT_TO"
  | "QUALIFICATIONS"
  | "MEMBERSHIP"
  | string;

export interface PimCustomField {
  _id: string;
  name: string;
  screen: PimScreen;
  fieldType: string; // you can narrow this later
}

/** ---- API ---- */
export const pimConfigApi = createApi({
  reducerPath: "pimConfigApi",
  baseQuery: authorizedBaseQuery,
  tagTypes: ["PimSettings", "PimCustomFields"],
  endpoints: (builder) => ({
    // GET /pim/screens
    getPimScreens: builder.query<PimScreen[], void>({
      query: () => "/pim/screens",
    }),

    // GET /pim/settings
    getOptionalFields: builder.query<PimOptionalFields, void>({
      query: () => "/pim/settings",
      providesTags: ["PimSettings"],
    }),

    // PUT /pim/settings
    updateOptionalFields: builder.mutation<PimOptionalFields, PimOptionalFields>(
      {
        query: (body) => ({
          url: "/pim/settings",
          method: "PUT",
          body,
        }),
        invalidatesTags: ["PimSettings"],
      }
    ),

    // GET /pim/custom-fields
    getCustomFields: builder.query<PimCustomField[], void>({
      query: () => "/pim/custom-fields",
      providesTags: ["PimCustomFields"],
    }),

    // POST /pim/custom-fields
    createCustomField: builder.mutation<PimCustomField, Partial<PimCustomField>>(
      {
        query: (body) => ({
          url: "/pim/custom-fields",
          method: "POST",
          body,
        }),
        invalidatesTags: ["PimCustomFields"],
      }
    ),

    // DELETE /pim/custom-fields/:id
    deleteCustomField: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/pim/custom-fields/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PimCustomFields"],
    }),

    // POST /pim/import  (CSV upload)
    uploadImport: builder.mutation<{ success: boolean }, FormData>({
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
} = pimConfigApi;
