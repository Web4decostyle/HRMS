// frontend/src/features/admin/adminApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authedBaseQuery } from "../apiBase";

/* ========= Types ========= */

export interface OrgUnit {
  _id: string;
  name: string;
  code?: string;
  parent?: string | null;
  description?: string;
}

export interface JobTitle {
  _id: string;
  name: string;
  code?: string;
  description?: string;
  note?: string;
  specFilePath?: string; // path/URL of uploaded job spec
}

export interface PayGrade {
  _id: string;
  name: string;
  currency?: string;
  minSalary?: number;
  maxSalary?: number;
}

export interface EmploymentStatus {
  _id: string;
  name: string;
}

export interface JobCategory {
  _id: string;
  name: string;
}

export interface WorkShift {
  _id: string;
  name: string;
  hoursPerDay: number;
}

export interface Location {
  _id: string;
  name: string;
  city?: string;
  country?: string;
  address?: string;
}

export interface GeneralInfo {
  _id: string;
  companyName: string;
  taxId?: string;
  registrationNumber?: string;
  phone?: string;
  fax?: string;
  email?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface Skill {
  _id: string;
  name: string;
  description?: string;
}

export interface Education {
  _id: string;
  level: string;
}

export interface Language {
  _id: string;
  name: string;
}

export interface License {
  _id: string;
  name: string;
}

export interface Nationality {
  _id: string;
  name: string;
}

export interface SystemUser {
  _id: string;
  username: string;
  role: "ADMIN" | "HR" | "ESS";
  status: "ENABLED" | "DISABLED";
  employeeName?: string;
}

/* Helper type for createJobTitle – supports JSON or FormData */
export type CreateJobTitlePayload =
  | { name: string; code?: string; description?: string; note?: string }
  | FormData;

/* ========= API ========= */

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: authedBaseQuery,
  tagTypes: [
    "OrgUnit",
    "JobTitle",
    "PayGrade",
    "EmploymentStatus",
    "JobCategory",
    "WorkShift",
    "Location",
    "GeneralInfo",
    "Skill",
    "Education",
    "Language",
    "License",
    "Nationality",
    "SystemUser",
  ],
  endpoints: (builder) => ({
    /* ----- Org Units ----- */
    getOrgUnits: builder.query<OrgUnit[], void>({
      query: () => "admin/org-units",
      providesTags: ["OrgUnit"],
    }),
    createOrgUnit: builder.mutation<
      OrgUnit,
      {
        name: string;
        code?: string;
        parent?: string | null;
        description?: string;
      }
    >({
      query: (body) => ({
        url: "admin/org-units",
        method: "POST",
        body,
      }),
      invalidatesTags: ["OrgUnit"],
    }),

    /* ----- Job Titles ----- */
    getJobTitles: builder.query<JobTitle[], void>({
      query: () => "admin/job-titles",
      providesTags: ["JobTitle"],
    }),
    createJobTitle: builder.mutation<JobTitle, CreateJobTitlePayload>({
      query: (body) => ({
        url: "admin/job-titles",
        method: "POST",
        body, // can be JSON object or FormData (for file upload)
      }),
      invalidatesTags: ["JobTitle"],
    }),

    /* ----- Pay Grades ----- */
    getPayGrades: builder.query<PayGrade[], void>({
      query: () => "admin/pay-grades",
      providesTags: ["PayGrade"],
    }),
    createPayGrade: builder.mutation<
      PayGrade,
      {
        name: string;
        currency?: string;
        minSalary?: number;
        maxSalary?: number;
      }
    >({
      query: (body) => ({
        url: "admin/pay-grades",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PayGrade"],
    }),
    updatePayGrade: builder.mutation<
      PayGrade,
      {
        id: string;
        name: string;
        currency?: string;
        minSalary?: number;
        maxSalary?: number;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `admin/pay-grades/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["PayGrade"],
    }),
    deletePayGrade: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `admin/pay-grades/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PayGrade"],
    }),

    /* ----- Employment Statuses ----- */
    getEmploymentStatuses: builder.query<EmploymentStatus[], void>({
      query: () => "admin/employment-status", // plural: matches backend
      providesTags: (result) =>
        result
          ? [
              ...result.map((s) => ({
                type: "EmploymentStatus" as const,
                id: s._id,
              })),
              { type: "EmploymentStatus" as const, id: "LIST" },
            ]
          : [{ type: "EmploymentStatus" as const, id: "LIST" }],
    }),

    createEmploymentStatus: builder.mutation<
      EmploymentStatus,
      { name: string }
    >({
      query: (body) => ({
        url: "admin/employment-status",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "EmploymentStatus", id: "LIST" }],
    }),

    updateEmploymentStatus: builder.mutation<
      EmploymentStatus,
      { id: string; name: string }
    >({
      query: ({ id, ...body }) => ({
        url: `admin/employment-status/${id}`, // plural path
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "EmploymentStatus", id },
      ],
    }),

    deleteEmploymentStatus: builder.mutation<
      { success: boolean; id: string },
      string
    >({
      query: (id) => ({
        url: `admin/employment-status/${id}`, // plural path
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "EmploymentStatus", id },
        { type: "EmploymentStatus", id: "LIST" },
      ],
    }),

    /* ----- Job Categories ----- */
    getJobCategories: builder.query<JobCategory[], void>({
      query: () => "admin/job-categories",
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({
                type: "JobCategory" as const,
                id: r._id,
              })),
              { type: "JobCategory" as const, id: "LIST" },
            ]
          : [{ type: "JobCategory" as const, id: "LIST" }],
    }),

    createJobCategory: builder.mutation<JobCategory, { name: string }>({
      query: (body) => ({
        url: "admin/job-categories",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "JobCategory", id: "LIST" }],
    }),

    updateJobCategory: builder.mutation<
      JobCategory,
      { id: string; name: string }
    >({
      query: ({ id, ...body }) => ({
        url: `admin/job-categories/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "JobCategory", id }],
    }),

    deleteJobCategory: builder.mutation<
      { success: boolean; id: string },
      string
    >({
      query: (id) => ({
        url: `admin/job-categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "JobCategory", id },
        { type: "JobCategory", id: "LIST" },
      ],
    }),

    /* ----- Work Shifts ----- */
    getWorkShifts: builder.query<WorkShift[], void>({
      query: () => "admin/work-shifts",
      providesTags: ["WorkShift"],
    }),
    createWorkShift: builder.mutation<
      WorkShift,
      { name: string; hoursPerDay: number }
    >({
      query: (body) => ({
        url: "admin/work-shifts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["WorkShift"],
    }),

    /* ----- Locations ----- */
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

    /* ----- General Info ----- */
    getGeneralInfo: builder.query<GeneralInfo | null, void>({
      query: () => "admin/organization/general-info",
      providesTags: ["GeneralInfo"],
    }),
    updateGeneralInfo: builder.mutation<GeneralInfo, Partial<GeneralInfo>>({
      query: (body) => ({
        url: "admin/organization/general-info",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["GeneralInfo"],
    }),

    /* ----- Qualifications: Skills ----- */
    getSkills: builder.query<Skill[], void>({
      query: () => "admin/qualifications/skills",
      providesTags: ["Skill"],
    }),
    createSkill: builder.mutation<
      Skill,
      { name: string; description?: string }
    >({
      query: (body) => ({
        url: "admin/qualifications/skills",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Skill"],
    }),

    /* ----- Qualifications: Education ----- */
    getEducationLevels: builder.query<Education[], void>({
      query: () => "admin/qualifications/education",
      providesTags: ["Education"],
    }),
    createEducationLevel: builder.mutation<Education, { level: string }>({
      query: (body) => ({
        url: "admin/qualifications/education",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Education"],
    }),

    /* ----- Qualifications: Languages ----- */
    getLanguages: builder.query<Language[], void>({
      query: () => "admin/qualifications/languages",
      providesTags: ["Language"],
    }),
    createLanguage: builder.mutation<Language, { name: string }>({
      query: (body) => ({
        url: "admin/qualifications/languages",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Language"],
    }),

    /* ----- Qualifications: Licenses ----- */
    getLicenses: builder.query<License[], void>({
      query: () => "admin/qualifications/licenses",
      providesTags: ["License"],
    }),
    createLicense: builder.mutation<License, { name: string }>({
      query: (body) => ({
        url: "admin/qualifications/licenses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["License"],
    }),

    /* ----- Nationalities ----- */
    getNationalities: builder.query<Nationality[], void>({
      query: () => "admin/nationalities",
      providesTags: ["Nationality"],
    }),
    createNationality: builder.mutation<Nationality, { name: string }>({
      query: (body) => ({
        url: "admin/nationalities",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Nationality"],
    }),

    /* ----- System Users ----- */
    getSystemUsers: builder.query<
      SystemUser[],
      { username?: string; role?: string; status?: string } | undefined
    >({
      query: (params) => ({
        url: "admin/system-users",
        params: params ?? undefined,
      }),
      providesTags: ["SystemUser"],
    }),
    createSystemUser: builder.mutation<
      SystemUser,
      {
        username: string;
        password: string;
        role: "ADMIN" | "HR" | "ESS";
        status?: "ENABLED" | "DISABLED";
        employeeName?: string;
      }
    >({
      query: (body) => ({
        url: "admin/system-users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SystemUser"],
    }),
    updateSystemUserStatus: builder.mutation<
      SystemUser,
      { id: string; status: "ENABLED" | "DISABLED" }
    >({
      query: ({ id, status }) => ({
        url: `admin/system-users/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["SystemUser"],
    }),
    deleteSystemUser: builder.mutation<
      { success: boolean; id: string },
      string
    >({
      query: (id) => ({
        url: `admin/system-users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SystemUser"],
    }),
  }),
});

/* ========= Export hooks ========= */

export const {
  useGetOrgUnitsQuery,
  useCreateOrgUnitMutation,

  useGetJobTitlesQuery,
  useCreateJobTitleMutation,

  useGetPayGradesQuery,
  useCreatePayGradeMutation,
  useUpdatePayGradeMutation,
  useDeletePayGradeMutation,

  useGetEmploymentStatusesQuery,
  useCreateEmploymentStatusMutation,
  useUpdateEmploymentStatusMutation,
  useDeleteEmploymentStatusMutation,

  useGetJobCategoriesQuery,
  useCreateJobCategoryMutation,
  useUpdateJobCategoryMutation,
  useDeleteJobCategoryMutation,

  useGetWorkShiftsQuery,
  useCreateWorkShiftMutation,

  useGetLocationsQuery,
  useCreateLocationMutation,

  useGetGeneralInfoQuery,
  useUpdateGeneralInfoMutation,

  useGetSkillsQuery,
  useCreateSkillMutation,

  useGetEducationLevelsQuery,
  useCreateEducationLevelMutation,

  useGetLanguagesQuery,
  useCreateLanguageMutation,

  useGetLicensesQuery,
  useCreateLicenseMutation,

  useGetNationalitiesQuery,
  useCreateNationalityMutation,

  useGetSystemUsersQuery,
  useCreateSystemUserMutation,
  useUpdateSystemUserStatusMutation,
  useDeleteSystemUserMutation,
} = adminApi;
