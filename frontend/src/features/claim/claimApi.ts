// frontend/src/features/claim/claimApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

export type ClaimStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ClaimType {
  _id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Claim {
  _id: string;
  referenceId?: string;
  employee:
    | string
    | {
        _id: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        status?: string;
      };
  type: string | { _id: string; name: string; code?: string };
  amount: number;
  currency: string;
  claimDate: string;
  description?: string;
  status: ClaimStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type EmployeeClaim = Claim;

export interface Paginated<T> {
  items: T[];
  total: number;
}

/* ----------------------- Filters (for UI) ----------------------- */

export interface MyClaimsFilter {
  referenceId?: string;
  typeId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export interface EmployeeClaimsFilter {
  employeeName?: string;
  referenceId?: string;
  typeId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  include?: "CURRENT" | "ALL";
}

/* ----------------------------- API ------------------------------ */

export const claimApi = createApi({
  reducerPath: "claimApi",
  baseQuery: authorizedBaseQuery,
  tagTypes: ["ClaimTypes", "MyClaims", "EmployeeClaims"],
  endpoints: (builder) => ({
    /* -------- Claim Types (used as "Event" in UI) -------- */

    getClaimTypes: builder.query<ClaimType[], void>({
      query: () => "/claim/types",
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({
                type: "ClaimTypes" as const,
                id: t._id,
              })),
              { type: "ClaimTypes" as const, id: "LIST" },
            ]
          : [{ type: "ClaimTypes" as const, id: "LIST" }],
    }),

    createClaimType: builder.mutation<
      ClaimType,
      { name: string; code: string; description?: string }
    >({
      query: (body) => ({
        url: "/claim/types",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ClaimTypes", id: "LIST" }],
    }),

    /* ----------------- Submit Claim (self) ----------------- */

    submitClaim: builder.mutation<
      Claim,
      { typeId: string; currency: string; remarks?: string }
    >({
      query: ({ typeId, currency, remarks }) => ({
        url: "/claim",
        method: "POST",
        body: {
          typeId,
          amount: 0, // required by schema
          currency,
          claimDate: new Date().toISOString(),
          description: remarks ?? "",
        },
      }),
      invalidatesTags: [
        { type: "MyClaims", id: "LIST" },
        { type: "EmployeeClaims", id: "LIST" },
      ],
    }),

    /* --------------------- My Claims ----------------------- */

    getMyClaims: builder.query<Paginated<Claim>, MyClaimsFilter | void>({
      query: (params) => ({
        url: "/claim/my",
        method: "GET",
        // 👇 cast to satisfy FetchArgs["params"] type
        params: params as any,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((c) => ({
                type: "MyClaims" as const,
                id: c._id,
              })),
              { type: "MyClaims" as const, id: "LIST" },
            ]
          : [{ type: "MyClaims", id: "LIST" }],
    }),

    /* ------------------- Employee Claims ------------------- */

    getEmployeeClaims: builder.query<
      Paginated<EmployeeClaim>,
      EmployeeClaimsFilter | void
    >({
      query: (params) => ({
        url: "/claim",
        method: "GET",
        // 👇 same cast here
        params: params as any,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((c) => ({
                type: "EmployeeClaims" as const,
                id: c._id,
              })),
              { type: "EmployeeClaims" as const, id: "LIST" },
            ]
          : [{ type: "EmployeeClaims", id: "LIST" }],
    }),

    /* -------------------- Assign Claim --------------------- */

    assignClaim: builder.mutation<
      Claim,
      { employeeId: string; typeId: string; currency: string; remarks?: string }
    >({
      query: ({ employeeId, typeId, currency, remarks }) => ({
        url: "/claim/assign",
        method: "POST",
        body: {
          employeeId,
          typeId,
          amount: 0,
          currency,
          claimDate: new Date().toISOString(),
          description: remarks ?? "",
        },
      }),
      invalidatesTags: [
        { type: "MyClaims", id: "LIST" },
        { type: "EmployeeClaims", id: "LIST" },
      ],
    }),

    /* ----------------- Approve / Reject etc ---------------- */

    updateClaimStatus: builder.mutation<
      Claim,
      { id: string; status: ClaimStatus }
    >({
      query: ({ id, status }) => ({
        url: `/claim/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "MyClaims", id: arg.id },
        { type: "EmployeeClaims", id: arg.id },
        { type: "MyClaims", id: "LIST" },
        { type: "EmployeeClaims", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetClaimTypesQuery,
  useCreateClaimTypeMutation,
  useSubmitClaimMutation,
  useGetMyClaimsQuery,
  useGetEmployeeClaimsQuery,
  useAssignClaimMutation,
  useUpdateClaimStatusMutation,
} = claimApi;
