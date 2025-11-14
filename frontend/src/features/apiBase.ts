// frontend/src/features/apiBase.ts
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authedBaseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:4000/api",
  prepareHeaders: (headers) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});
