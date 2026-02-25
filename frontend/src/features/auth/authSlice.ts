import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Role = "ADMIN" | "HR" | "SUPERVISOR" | "ESS" | "ESS_VIEWER";

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  isActive: boolean;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

function readToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function isRole(v: any): v is Role {
  return v === "ADMIN" || v === "HR" || v === "SUPERVISOR" || v === "ESS" || v === "ESS_VIEWER";
}

function readUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    // ✅ basic safety to avoid corrupted storage making UI think admin
    if (!parsed?.id || !parsed?.username || !isRole(parsed?.role)) return null;
    return parsed as AuthUser;
  } catch {
    return null;
  }
}

const initialState: AuthState = {
  token: readToken(),
  user: readUser(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;

      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload));
      }
    },
    clearAuth: (state) => {
      state.token = null;
      state.user = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    },
  },
});

export const { setCredentials, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
export type { AuthUser as SliceAuthUser };