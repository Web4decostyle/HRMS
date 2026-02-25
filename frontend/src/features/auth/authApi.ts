import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  clearAuth,
  setCredentials,
  setUser,
  type AuthUser as SliceAuthUser,
  type Role,
} from "./authSlice";

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: Role;
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
}

export interface RegisterResponse {
  token: string;
  user: AuthUser;
}

export interface MeResponse {
  user: AuthUser;
}

export interface AdminCreateUserRequest {
  username: string;
  email?: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive?: boolean;
}

export interface AdminCreateUserResponse {
  user: AuthUser;
}

export const authApi = createApi({
  reducerPath: "authApi",

  // ✅ ADD tagTypes
  tagTypes: ["Me"],

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api",
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) headers.set("authorization", `Bearer ${token}`);
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
        // ✅ HARD reset cached queries before setting new user
        dispatch(authApi.util.resetApiState());
        dispatch(clearAuth());

        try {
          const { data } = await queryFulfilled;

          dispatch(
            setCredentials({
              token: data.token,
              user: data.user as SliceAuthUser,
            })
          );

          // ✅ Force refetch /me after login so UI always shows correct name
          dispatch(authApi.util.invalidateTags(["Me"]));
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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.token && data?.user) {
            dispatch(
              setCredentials({
                token: data.token,
                user: data.user as SliceAuthUser,
              })
            );
            dispatch(authApi.util.invalidateTags(["Me"]));
          }
        } catch {
          // ignore
        }
      },
    }),

    adminCreateUser: builder.mutation<
      AdminCreateUserResponse,
      AdminCreateUserRequest
    >({
      query: (body) => ({
        url: "auth/admin/create-user",
        method: "POST",
        body,
      }),
    }),

    me: builder.query<MeResponse, void>({
      query: () => ({
        url: "auth/me",
        method: "GET",
      }),

      // ✅ provides tag so it can be invalidated
      providesTags: ["Me"],

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
  useAdminCreateUserMutation,
  useMeQuery,
} = authApi;