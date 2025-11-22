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

    /* ----- Employment Status ----- */
    getEmploymentStatuses: builder.query<EmploymentStatus[], void>({
      query: () => "admin/employment-statuses",
      providesTags: ["EmploymentStatus"],
    }),
    createEmploymentStatus: builder.mutation<
      EmploymentStatus,
      { name: string }
    >({
      query: (body) => ({
        url: "admin/employment-statuses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EmploymentStatus"],
    }),

    /* ----- Job Categories ----- */
    getJobCategories: builder.query<JobCategory[], void>({
      query: () => "admin/job-categories",
      providesTags: ["JobCategory"],
    }),
    createJobCategory: builder.mutation<JobCategory, { name: string }>({
      query: (body) => ({
        url: "admin/job-categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["JobCategory"],
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
        // if params is undefined, this becomes `undefined` which is valid
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

export const {
  useGetOrgUnitsQuery,
  useCreateOrgUnitMutation,
  useGetJobTitlesQuery,
  useCreateJobTitleMutation,
  useGetPayGradesQuery,
  useCreatePayGradeMutation,
  useGetEmploymentStatusesQuery,
  useCreateEmploymentStatusMutation,
  useGetJobCategoriesQuery,
  useCreateJobCategoryMutation,
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
