import { createApi } from "@reduxjs/toolkit/query/react";
import { authedBaseQuery } from "../apiBase";

export interface Job {
  _id: string;
  title: string;
  code: string;
  description?: string;
  status: "OPEN" | "CLOSED";
}

export interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  job: Job | string;
  status:
    | "APPLIED"
    | "SHORTLISTED"
    | "INTERVIEW"
    | "OFFEred"
    | "HIred"
    | "REJECTED";
  resumeUrl?: string;
  notes?: string;
}

export type VacancyStatus = "OPEN" | "CLOSED";

export interface Vacancy {
  _id: string;
  name: string;
  job: Job | string;
  hiringManagerEmployeeId?: string;
  hiringManagerName?: string;
  hiringManagerEmail?: string;
  status: VacancyStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVacancyInput {
  jobId: string;
  name: string;
  hiringManagerName?: string;
  hiringManagerEmployeeId?: string;
  status?: VacancyStatus;
}

export const recruitmentApi = createApi({
  reducerPath: "recruitmentApi",
  baseQuery: authedBaseQuery,
  tagTypes: ["Job", "Candidate", "Vacancy"],
  endpoints: (builder) => ({
    // Jobs
    getJobs: builder.query<Job[], void>({
      query: () => "/recruitment/jobs",
      providesTags: ["Job"],
    }),
    createJob: builder.mutation<
      Job,
      {
        title: string;
        code: string;
        description?: string;
        hiringManager?: string;
      }
    >({
      query: (body) => ({
        url: "/recruitment/jobs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Job"],
    }),

    getCandidateById: builder.query<any, string>({
      query: (id) => `/recruitment/candidates/${id}`,
    }),

    // Candidates
    getCandidates: builder.query<Candidate[], { jobId?: string } | void>({
      query: (params) => {
        const search = params?.jobId ? `?jobId=${params.jobId}` : "";
        return `/recruitment/candidates${search}`;
      },
      providesTags: ["Candidate"],
    }),

    // ✅ If using file upload, use this :
    createCandidate: builder.mutation<Candidate, FormData>({
      query: (formData) => ({
        url: "/recruitment/candidates",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Candidate"],
    }),

    // ✅ Interview date -> generates TEMP code
    setInterviewDate: builder.mutation<
      any,
      { id: string; interviewDate: string }
    >({
      query: ({ id, interviewDate }) => ({
        url: `/recruitment/candidates/${id}/interview`,
        method: "PATCH",
        body: { interviewDate },
      }),
      invalidatesTags: ["Candidate"],
    }),

    updateCandidateStatus: builder.mutation<
      Candidate,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/recruitment/candidates/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Candidate"],
    }),

    // ✅ Interviewed candidates list (filterable)
    getInterviewedCandidates: builder.query<
      any[],
      { tempCode?: string; status?: string } | void
    >({
      query: (params) => {
        const sp = new URLSearchParams();
        if (params?.tempCode) sp.set("tempCode", params.tempCode);
        if (params?.status) sp.set("status", params.status);
        const qs = sp.toString();
        return `/recruitment/candidates/interviewed${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Candidate"],
    }),

    // Vacancies
    getVacancies: builder.query<Vacancy[], void>({
      query: () => "/recruitment/vacancies",
      providesTags: ["Vacancy"],
    }),
    createVacancy: builder.mutation<Vacancy, CreateVacancyInput>({
      query: (body) => ({
        url: "/recruitment/vacancies",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Vacancy"],
    }),
  }),
});

export const {
  useGetJobsQuery,
  useCreateJobMutation,
  useGetCandidatesQuery,
  useGetCandidateByIdQuery,
  useCreateCandidateMutation,
  useUpdateCandidateStatusMutation,
  useGetVacanciesQuery,
  useCreateVacancyMutation,
  useSetInterviewDateMutation,
  useGetInterviewedCandidatesQuery,
} = recruitmentApi;
