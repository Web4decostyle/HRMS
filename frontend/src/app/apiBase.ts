// frontend/src/app/apiBase.ts
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authorizedBaseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:4000/api",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) headers.set("authorization", `Bearer ${token}`);

    return headers;
  },
});
