// frontend/src/features/navigation/navigationApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  path?: string;
}

export interface MenuResponse {
  items: MenuItem[];
}

export const navigationApi = createApi({
  reducerPath: "navigationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api",
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getMenu: builder.query<MenuResponse, void>({
      query: () => ({
        url: "navigation/menu",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetMenuQuery } = navigationApi;
