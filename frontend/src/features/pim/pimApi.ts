// frontend/src/features/pim/pimApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

export interface EmergencyContact {
  _id: string;
  employee: string;
  name: string;
  relationship?: string;
  homePhone?: string;
  mobilePhone?: string;
  workPhone?: string;
}

export interface Dependent {
  _id: string;
  employee: string;
  name: string;
  relationship?: string;
  dateOfBirth?: string;
}

export interface Education {
  _id: string;
  employee: string;
  level?: string;
  institute?: string;
  major?: string;
  year?: string;
  score?: string;
}

export interface WorkExperience {
  _id: string;
  employee: string;
  employer: string;
  jobTitle?: string;
  fromDate?: string;
  toDate?: string;
  comment?: string;
}

export const pimApi = createApi({
  reducerPath: "pimApi",
  baseQuery: authorizedBaseQuery,
  tagTypes: [
    "EmergencyContact",
    "Dependent",
    "Education",
    "WorkExperience",
  ],
  endpoints: (builder) => ({
    /* ------- Emergency Contacts ------- */
    getEmergencyContacts: builder.query<EmergencyContact[], string>({
      // employeeId
      query: (employeeId) =>
        `pim/employees/${encodeURIComponent(employeeId)}/emergency-contacts`,
      providesTags: ["EmergencyContact"],
    }),
    createEmergencyContact: builder.mutation<
      EmergencyContact,
      { employeeId: string; data: Partial<EmergencyContact> }
    >({
      query: ({ employeeId, data }) => ({
        url: `pim/employees/${encodeURIComponent(
          employeeId
        )}/emergency-contacts`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["EmergencyContact"],
    }),
    deleteEmergencyContact: builder.mutation<void, { employeeId: string; id: string }>({
      query: ({ employeeId, id }) => ({
        url: `pim/employees/${encodeURIComponent(
          employeeId
        )}/emergency-contacts/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EmergencyContact"],
    }),

    /* ------- Dependents ------- */
    getDependents: builder.query<Dependent[], string>({
      query: (employeeId) =>
        `pim/employees/${encodeURIComponent(employeeId)}/dependents`,
      providesTags: ["Dependent"],
    }),
    createDependent: builder.mutation<
      Dependent,
      { employeeId: string; data: Partial<Dependent> }
    >({
      query: ({ employeeId, data }) => ({
        url: `pim/employees/${encodeURIComponent(employeeId)}/dependents`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Dependent"],
    }),
    deleteDependent: builder.mutation<void, { employeeId: string; id: string }>({
      query: ({ employeeId, id }) => ({
        url: `pim/employees/${encodeURIComponent(
          employeeId
        )}/dependents/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Dependent"],
    }),

    /* ------- Education ------- */
    getEducation: builder.query<Education[], string>({
      query: (employeeId) =>
        `pim/employees/${encodeURIComponent(employeeId)}/education`,
      providesTags: ["Education"],
    }),
    createEducation: builder.mutation<
      Education,
      { employeeId: string; data: Partial<Education> }
    >({
      query: ({ employeeId, data }) => ({
        url: `pim/employees/${encodeURIComponent(employeeId)}/education`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Education"],
    }),
    deleteEducation: builder.mutation<void, { employeeId: string; id: string }>({
      query: ({ employeeId, id }) => ({
        url: `pim/employees/${encodeURIComponent(
          employeeId
        )}/education/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Education"],
    }),

    /* ------- Work Experience ------- */
    getWorkExperience: builder.query<WorkExperience[], string>({
      query: (employeeId) =>
        `pim/employees/${encodeURIComponent(employeeId)}/experience`,
      providesTags: ["WorkExperience"],
    }),
    createWorkExperience: builder.mutation<
      WorkExperience,
      { employeeId: string; data: Partial<WorkExperience> }
    >({
      query: ({ employeeId, data }) => ({
        url: `pim/employees/${encodeURIComponent(employeeId)}/experience`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["WorkExperience"],
    }),
    deleteWorkExperience: builder.mutation<
      void,
      { employeeId: string; id: string }
    >({
      query: ({ employeeId, id }) => ({
        url: `pim/employees/${encodeURIComponent(
          employeeId
        )}/experience/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["WorkExperience"],
    }),
  }),
});

export const {
  useGetEmergencyContactsQuery,
  useCreateEmergencyContactMutation,
  useDeleteEmergencyContactMutation,
  useGetDependentsQuery,
  useCreateDependentMutation,
  useDeleteDependentMutation,
  useGetEducationQuery,
  useCreateEducationMutation,
  useDeleteEducationMutation,
  useGetWorkExperienceQuery,
  useCreateWorkExperienceMutation,
  useDeleteWorkExperienceMutation,
} = pimApi;
