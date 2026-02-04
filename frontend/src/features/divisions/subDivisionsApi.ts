// frontend/src/features/divisions/subDivisionsApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";
import type { SubDivision } from "./divisionsApi";

export const subDivisionsApi = createApi({
  reducerPath: "subDivisionsApi",
  baseQuery: authorizedBaseQuery,
  tagTypes: ["SubDivision"],
  endpoints: (builder) => ({
    getSubDivisions: builder.query<SubDivision[], { divisionId: string }>({
      query: ({ divisionId }) => ({
        url: `divisions/${divisionId}/sub-divisions`,
        method: "GET",
      }),
      providesTags: (result, _err, arg) =>
        result
          ? [
              ...result.map((s) => ({
                type: "SubDivision" as const,
                id: s._id,
              })),
              { type: "SubDivision" as const, id: `LIST-${arg.divisionId}` },
            ]
          : [{ type: "SubDivision" as const, id: `LIST-${arg.divisionId}` }],
    }),

    createSubDivision: builder.mutation<
      SubDivision,
      { divisionId: string; body: Partial<SubDivision> }
    >({
      query: ({ divisionId, body }) => ({
        url: `divisions/${divisionId}/sub-divisions`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "SubDivision", id: `LIST-${arg.divisionId}` },
      ],
    }),

    updateSubDivision: builder.mutation<
      SubDivision,
      { divisionId: string; id: string; body: any }
    >({
      query: ({ divisionId, id, body }) => ({
        url: `divisions/${divisionId}/sub-divisions/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "SubDivision", id: arg.id },
        { type: "SubDivision", id: `LIST-${arg.divisionId}` },
      ],
    }),

    deleteSubDivision: builder.mutation<
      { ok: true },
      { divisionId: string; id: string }
    >({
      query: ({ divisionId, id }) => ({
        url: `divisions/${divisionId}/sub-divisions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "SubDivision", id: `LIST-${arg.divisionId}` },
      ],
    }),
  }),
});

export const {
  useGetSubDivisionsQuery,
  useCreateSubDivisionMutation,
  useUpdateSubDivisionMutation,
  useDeleteSubDivisionMutation,
} = subDivisionsApi;
