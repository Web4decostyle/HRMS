// frontend/src/features/recruitment/recruitmentApi.ts
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
    | "OFFERED"
    | "HIRED"
    | "REJECTED";
  resumeUrl?: string;
  notes?: string;
}

export type VacancyStatus = "OPEN" | "CLOSED";

export interface Vacancy {
  _id: string;
  name: string; // vacancy name
  job: Job | string;
  hiringManagerName?: string;
  status: VacancyStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVacancyInput {
  jobId: string;
  name: string;
  hiringManagerName?: string;
  status?: VacancyStatus;
}

export const recruitmentApi = createApi({
  reducerPath: "recruitmentApi",
  baseQuery: authedBaseQuery,
  tagTypes: ["Job", "Candidate", "Vacancy"],
  endpoints: (builder) => ({
    // Jobs
    getJobs: builder.query<Job[], void>({
      query: () => "recruitment/jobs",
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
        url: "recruitment/jobs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Job"],
    }),

    // Candidates
    getCandidates: builder.query<Candidate[], { jobId?: string } | void>({
      query: (params) => {
        const search = params?.jobId ? `?jobId=${params.jobId}` : "";
        return `recruitment/candidates${search}`;
      },
      providesTags: ["Candidate"],
    }),
    createCandidate: builder.mutation<
      Candidate,
      {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        jobId: string;
        resumeUrl?: string;
        notes?: string;
      }
    >({
      query: (body) => ({
        url: "recruitment/candidates",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Candidate"],
    }),
    updateCandidateStatus: builder.mutation<
      Candidate,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `recruitment/candidates/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Candidate"],
    }),

    // Vacancies
    getVacancies: builder.query<Vacancy[], void>({
      query: () => "recruitment/vacancies",
      providesTags: ["Vacancy"],
    }),
    createVacancy: builder.mutation<Vacancy, CreateVacancyInput>({
      query: (body) => ({
        url: "recruitment/vacancies",
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
  useCreateCandidateMutation,
  useUpdateCandidateStatusMutation,
  useGetVacanciesQuery,
  useCreateVacancyMutation,
} = recruitmentApi;
