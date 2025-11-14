// frontend/src/features/help/helpApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

export interface HelpTopic {
  id: string;
  title: string;
  url: string;
}

export const helpApi = createApi({
  reducerPath: "helpApi",
  baseQuery: authorizedBaseQuery,
  endpoints: (builder) => ({
    getHelpTopics: builder.query<{ topics: HelpTopic[] }, void>({
      query: () => "help/topics",
    }),
  }),
});

export const { useGetHelpTopicsQuery } = helpApi;
