// frontend/src/features/performance/performanceApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

/* ------------------------------
   TYPES
------------------------------ */

export interface Kpi {
  _id: string;
  jobTitle: string;
  kpiTitle: string;
  minRate: number;
  maxRate: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface Tracker {
  _id: string;
  name: string;
  employee: any;
  reviewers: any[];
  isActive: boolean;
}

export interface Review {
  _id: string;
  employee: any;
  reviewer: any;
  additionalReviewers: any[];
  jobTitle: string;
  subUnit?: string;

  periodFrom: string;
  periodTo: string;
  dueDate: string;

  status:
    | "NOT_STARTED"
    | "ACTIVATED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "ARCHIVED";

  overallRating?: number;

  kpiRatings: {
    kpi: string;
    rating?: number;
    comment?: string;
  }[];
}

/* ------------------------------
   API
------------------------------ */

export const performanceApi = createApi({
  reducerPath: "performanceApi",
  baseQuery: authorizedBaseQuery,
  tagTypes: [
    "KPIS",
    "TRACKERS",
    "REVIEWS",
    "MY_REVIEWS",
    "EMPLOYEE_REVIEWS",
    "MY_TRACKERS",
    "EMP_TRACKERS",
  ],

  endpoints: (builder) => ({
    /* ===== KPIs ===== */
    getKpis: builder.query<Kpi[], { jobTitle?: string } | void>({
      query: (params?: { jobTitle?: string }) => ({
        url: "/performance/kpis",
        params, // now type is {..} | undefined, not void
      }),
      providesTags: ["KPIS"],
    }),

    createKpi: builder.mutation({
      query: (body) => ({
        url: "/performance/kpis",
        method: "POST",
        body,
      }),
      invalidatesTags: ["KPIS"],
    }),

    updateKpi: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/performance/kpis/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["KPIS"],
    }),

    deleteKpi: builder.mutation({
      query: (id) => ({
        url: `/performance/kpis/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["KPIS"],
    }),

    /* ===== Trackers ===== */
    getTrackers: builder.query<Tracker[], any>({
      query: (params) => ({
        url: "/performance/trackers",
        params,
      }),
      providesTags: ["TRACKERS"],
    }),

    createTracker: builder.mutation({
      query: (body) => ({
        url: "/performance/trackers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TRACKERS"],
    }),

    updateTracker: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/performance/trackers/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["TRACKERS"],
    }),

    deleteTracker: builder.mutation({
      query: (id) => ({
        url: `/performance/trackers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TRACKERS"],
    }),

    /* My Trackers */
    getMyTrackers: builder.query<Tracker[], void>({
      query: () => "/performance/trackers/my",
      providesTags: ["MY_TRACKERS"],
    }),

    /* Employee Trackers */
    getEmployeeTrackers: builder.query<Tracker[], void>({
      query: () => "/performance/trackers/me-as-employee",
      providesTags: ["EMP_TRACKERS"],
    }),

    /* ===== Reviews ===== */
    getReviews: builder.query<Review[], any>({
      query: (params) => ({
        url: "/performance/reviews",
        params,
      }),
      providesTags: ["REVIEWS"],
    }),

    getReviewById: builder.query<Review, string>({
      query: (id) => `/performance/reviews/${id}`,
      providesTags: ["REVIEWS"],
    }),

    createReview: builder.mutation({
      query: (body) => ({
        url: "/performance/reviews",
        method: "POST",
        body,
      }),
      invalidatesTags: ["REVIEWS"],
    }),

    updateReview: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/performance/reviews/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["REVIEWS"],
    }),

    deleteReview: builder.mutation({
      query: (id) => ({
        url: `/performance/reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["REVIEWS"],
    }),

    /* My Reviews */
    getMyReviews: builder.query<Review[], void>({
      query: () => "/performance/reviews/my",
      providesTags: ["MY_REVIEWS"],
    }),

    /* Employee Reviews */
    getEmployeeReviews: builder.query<Review[], void>({
      query: () => "/performance/reviews/as-reviewer",
      providesTags: ["EMPLOYEE_REVIEWS"],
    }),
  }),
});

export const {
  useGetKpisQuery,
  useCreateKpiMutation,
  useUpdateKpiMutation,
  useDeleteKpiMutation,

  useGetTrackersQuery,
  useCreateTrackerMutation,
  useUpdateTrackerMutation,
  useDeleteTrackerMutation,

  useGetMyTrackersQuery,
  useGetEmployeeTrackersQuery,

  useGetReviewsQuery,
  useGetReviewByIdQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,

  useGetMyReviewsQuery,
  useGetEmployeeReviewsQuery,
} = performanceApi;
