// frontend/src/features/claim/claimApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

export type ClaimStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ClaimType {
  _id: string;
  name: string;
  code: string;
  description?: string;
}

export interface ClaimRequest {
  _id: string;
  employee: any;
  type: ClaimType | string;
  amount: number;
  currency: string;
  claimDate: string;
  description?: string;
  status: ClaimStatus;
}

export const claimApi = createApi({
  reducerPath: "claimApi",
  baseQuery: authorizedBaseQuery,
  tagTypes: ["Claim", "ClaimType"],
  endpoints: (builder) => ({
    getClaimTypes: builder.query<ClaimType[], void>({
      query: () => "claim/types",
      providesTags: ["ClaimType"],
    }),
    createClaimType: builder.mutation<ClaimType, Partial<ClaimType>>({
      query: (body) => ({
        url: "claim/types",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ClaimType"],
    }),
    submitClaim: builder.mutation<
      ClaimRequest,
      { typeId: string; amount: number; currency?: string; claimDate: string; description?: string }
    >({
      query: (body) => ({
        url: "claim",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Claim"],
    }),
    getMyClaims: builder.query<ClaimRequest[], void>({
      query: () => "claim/my",
      providesTags: ["Claim"],
    }),
    getAllClaims: builder.query<ClaimRequest[], void>({
      query: () => "claim",
      providesTags: ["Claim"],
    }),
    updateClaimStatus: builder.mutation<ClaimRequest, { id: string; status: ClaimStatus }>({
      query: ({ id, status }) => ({
        url: `claim/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Claim"],
    }),
  }),
});

export const {
  useGetClaimTypesQuery,
  useCreateClaimTypeMutation,
  useSubmitClaimMutation,
  useGetMyClaimsQuery,
  useGetAllClaimsQuery,
  useUpdateClaimStatusMutation,
} = claimApi;
