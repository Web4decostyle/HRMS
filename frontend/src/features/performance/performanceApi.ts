// frontend/src/features/performance/performanceApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authedBaseQuery } from "../apiBase";

export interface PerformanceReview {
  _id: string;
  employee: any;
  reviewer: any;
  periodStart: string;
  periodEnd: string;
  rating: number;
  comments?: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED";
}

export const performanceApi = createApi({
  reducerPath: "performanceApi",
  baseQuery: authedBaseQuery,
  tagTypes: ["Review"],
  endpoints: (builder) => ({
    getReviews: builder.query<PerformanceReview[], void>({
      query: () => "performance/reviews",
      providesTags: ["Review"],
    }),
    getEmployeeReviews: builder.query<PerformanceReview[], string>({
      query: (employeeId) => `performance/reviews/employee/${employeeId}`,
      providesTags: ["Review"],
    }),
    createReview: builder.mutation<
      PerformanceReview,
      {
        employeeId: string;
        reviewerId: string;
        periodStart: string;
        periodEnd: string;
        rating: number;
        comments?: string;
      }
    >({
      query: (body) => ({
        url: "performance/reviews",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Review"],
    }),
    updateReviewStatus: builder.mutation<
      PerformanceReview,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `performance/reviews/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Review"],
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useGetEmployeeReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewStatusMutation,
} = performanceApi;
