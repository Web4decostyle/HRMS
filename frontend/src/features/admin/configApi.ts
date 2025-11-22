import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

export const configApi = createApi({
  reducerPath: "configApi",
  baseQuery: authorizedBaseQuery,
  tagTypes: ["EmailConfig"],
  endpoints: (builder) => ({
    getEmailConfig: builder.query({
      query: () => "/config/email",
      providesTags: ["EmailConfig"],
    }),

    saveEmailConfig: builder.mutation({
      query: (body) => ({
        url: "/config/email",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EmailConfig"],
    }),

    sendTestMail: builder.mutation({
      query: (to) => ({
        url: "/config/email/test",
        method: "POST",
        body: { to },
      }),
    }),
  }),
});

export const {
  useGetEmailConfigQuery,
  useSaveEmailConfigMutation,
  useSendTestMailMutation,
} = configApi;
