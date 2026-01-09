import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearAuth, setCredentials, setUser, type AuthUser as SliceAuthUser } from "./authSlice";

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterRequest {
  username: string;
  email?: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive?: boolean;
}

export interface RegisterResponse {
  user: AuthUser;
}

export interface MeResponse {
  user: AuthUser;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api",
    prepareHeaders: (headers) => {
      const token = typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ token: data.token, user: data.user as SliceAuthUser }));
        } catch {
          // ignore
        }
      },
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: "auth/register",
        method: "POST",
        body,
      }),
    }),
    me: builder.query<MeResponse, void>({
      query: () => ({
        url: "auth/me",
        method: "GET",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.user) dispatch(setUser(data.user as SliceAuthUser));
        } catch {
          dispatch(clearAuth());
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useMeQuery,
} = authApi;
