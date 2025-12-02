// frontend/src/features/claim/claimConfigApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface ClaimEvent {
  _id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseType {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Paginated<T> {
  items: T[];
  total: number;
}

/* ------------------------------------------------------------------ */
/* API slice                                                          */
/* ------------------------------------------------------------------ */

export const claimConfigApi = createApi({
  reducerPath: "claimConfigApi",
  baseQuery: authorizedBaseQuery,
  tagTypes: ["ClaimEvents", "ExpenseTypes"],
  endpoints: (builder) => ({
    /* ======================= EVENTS CONFIG ======================== */

    // GET /claim-config/events
    getClaimEvents: builder.query<Paginated<ClaimEvent>, void>({
      query: () => "/claim-config/events",
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((e) => ({
                type: "ClaimEvents" as const,
                id: e._id,
              })),
              { type: "ClaimEvents" as const, id: "LIST" },
            ]
          : [{ type: "ClaimEvents" as const, id: "LIST" }],
    }),

    // POST /claim-config/events
    createClaimEvent: builder.mutation<
      ClaimEvent,
      { name: string; status?: "ACTIVE" | "INACTIVE" }
    >({
      query: (body) => ({
        url: "/claim-config/events",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ClaimEvents", id: "LIST" }],
    }),

    // PUT /claim-config/events/:id
    updateClaimEvent: builder.mutation<
      ClaimEvent,
      { id: string; name: string; status: "ACTIVE" | "INACTIVE" }
    >({
      query: ({ id, ...patch }) => ({
        url: `/claim-config/events/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "ClaimEvents", id: arg.id },
        { type: "ClaimEvents", id: "LIST" },
      ],
    }),

    // DELETE /claim-config/events/:id
    deleteClaimEvent: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/claim-config/events/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "ClaimEvents", id },
        { type: "ClaimEvents", id: "LIST" },
      ],
    }),

    /* ===================== EXPENSE TYPES CONFIG =================== */

    // GET /claim-config/expense-types
    getExpenseTypes: builder.query<Paginated<ExpenseType>, void>({
      query: () => "/claim-config/expense-types",
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((e) => ({
                type: "ExpenseTypes" as const,
                id: e._id,
              })),
              { type: "ExpenseTypes" as const, id: "LIST" },
            ]
          : [{ type: "ExpenseTypes" as const, id: "LIST" }],
    }),

    // POST /claim-config/expense-types
    createExpenseType: builder.mutation<ExpenseType, { name: string }>({
      query: (body) => ({
        url: "/claim-config/expense-types",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ExpenseTypes", id: "LIST" }],
    }),

    // PUT /claim-config/expense-types/:id
    updateExpenseType: builder.mutation<
      ExpenseType,
      { id: string; name: string }
    >({
      query: ({ id, ...patch }) => ({
        url: `/claim-config/expense-types/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "ExpenseTypes", id: arg.id },
        { type: "ExpenseTypes", id: "LIST" },
      ],
    }),

    // DELETE /claim-config/expense-types/:id
    deleteExpenseType: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/claim-config/expense-types/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "ExpenseTypes", id },
        { type: "ExpenseTypes", id: "LIST" },
      ],
    }),
  }),
});

/* ------------------------------------------------------------------ */
/* Hooks                                                              */
/* ------------------------------------------------------------------ */

export const {
  useGetClaimEventsQuery,
  useCreateClaimEventMutation,
  useUpdateClaimEventMutation,
  useDeleteClaimEventMutation,
  useGetExpenseTypesQuery,
  useCreateExpenseTypeMutation,
  useUpdateExpenseTypeMutation,
  useDeleteExpenseTypeMutation,
} = claimConfigApi;
