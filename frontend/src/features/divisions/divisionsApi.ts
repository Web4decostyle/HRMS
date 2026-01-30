// frontend/src/features/divisions/divisionsApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

export interface Division {
  _id: string;
  name: string;
  code?: string;
  description?: string;
  managerEmployee?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const divisionsApi = createApi({
  reducerPath: "divisionsApi",
  baseQuery: authorizedBaseQuery,
  tagTypes: ["Division"],
  endpoints: (builder) => ({
    getDivisions: builder.query<Division[], void>({
      query: () => ({ url: "divisions", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((d) => ({ type: "Division" as const, id: d._id })),
              { type: "Division" as const, id: "LIST" },
            ]
          : [{ type: "Division" as const, id: "LIST" }],
    }),

    createDivision: builder.mutation<
      Division,
      Partial<Division> & { managerEmployeeId?: string | null }
    >({
      query: (body) => ({
        url: "divisions",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Division", id: "LIST" }],
    }),

    updateDivision: builder.mutation<Division, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `divisions/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Division", id: arg.id },
        { type: "Division", id: "LIST" },
      ],
    }),

    deleteDivision: builder.mutation<{ ok: true }, string>({
      query: (id) => ({
        url: `divisions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Division", id: "LIST" }],
    }),
  }),
});

export const {
  useGetDivisionsQuery,
  useCreateDivisionMutation,
  useUpdateDivisionMutation,
  useDeleteDivisionMutation,
} = divisionsApi;
