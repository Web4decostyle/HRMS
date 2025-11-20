import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

export const myInfoApi = createApi({
  reducerPath: "myInfoApi",
  baseQuery: authorizedBaseQuery, // ✅ reuse common base query
  tagTypes: ["Job", "Salary", "Tax", "Supervisor", "Subordinate"],
  endpoints: (builder) => ({
    // ---------- JOB DETAILS ----------
    getJob: builder.query({
      query: (employeeId: string) => `/employees/${employeeId}/job`,
      providesTags: ["Job"],
    }),
    updateJob: builder.mutation({
      query: ({ employeeId, data }: { employeeId: string; data: any }) => ({
        url: `/employees/${employeeId}/job`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Job"],
    }),

    /* -------------------------------------------
     * SALARY COMPONENTS
     * ------------------------------------------- */
    getSalary: builder.query({
      query: (employeeId: string) => `/employees/${employeeId}/salary`,
      providesTags: ["Salary"],
    }),

    createSalary: builder.mutation({
      query: ({ employeeId, data }) => ({
        url: `/employees/${employeeId}/salary`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Salary"],
    }),

    deleteSalary: builder.mutation({
      query: ({ employeeId, salaryId }) => ({
        url: `/employees/${employeeId}/salary/${salaryId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Salary"],
    }),

    /* -------------------------------------------
     * TAX
     * ------------------------------------------- */
    getTax: builder.query({
      query: (employeeId: string) => `/employees/${employeeId}/tax`,
      providesTags: ["Tax"],
    }),

    updateTax: builder.mutation({
      query: ({ employeeId, data }) => ({
        url: `/employees/${employeeId}/tax`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Tax"],
    }),

    /* -------------------------------------------
     * SUPERVISORS
     * ------------------------------------------- */
    getSupervisors: builder.query({
      query: (employeeId: string) => `/employees/${employeeId}/supervisors`,
      providesTags: ["Supervisor"],
    }),

    createSupervisor: builder.mutation({
      query: ({ employeeId, data }) => ({
        url: `/employees/${employeeId}/supervisors`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Supervisor"],
    }),

    deleteSupervisor: builder.mutation({
      query: ({ employeeId, id }) => ({
        url: `/employees/${employeeId}/supervisors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Supervisor"],
    }),

    /* -------------------------------------------
     * SUBORDINATES
     * ------------------------------------------- */
    getSubordinates: builder.query({
      query: (employeeId: string) => `/employees/${employeeId}/subordinates`,
      providesTags: ["Subordinate"],
    }),

    createSubordinate: builder.mutation({
      query: ({ employeeId, data }) => ({
        url: `/employees/${employeeId}/subordinates`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subordinate"],
    }),

    deleteSubordinate: builder.mutation({
      query: ({ employeeId, id }) => ({
        url: `/employees/${employeeId}/subordinates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subordinate"],
    }),
  }),
});

export const {
  /* Job */
  useGetJobQuery,
  useUpdateJobMutation,

  /* Salary */
  useGetSalaryQuery,
  useCreateSalaryMutation,
  useDeleteSalaryMutation,

  /* Tax */
  useGetTaxQuery,
  useUpdateTaxMutation,

  /* Supervisors */
  useGetSupervisorsQuery,
  useCreateSupervisorMutation,
  useDeleteSupervisorMutation,

  /* Subordinates */
  useGetSubordinatesQuery,
  useCreateSubordinateMutation,
  useDeleteSubordinateMutation,
} = myInfoApi;
