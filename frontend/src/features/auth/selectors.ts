import { RootState } from "../../app/store";
import type { Role } from "./authSlice";

export const selectAuth = (s: RootState) => s.auth;
export const selectAuthUser = (s: RootState) => s.auth.user;
export const selectAuthToken = (s: RootState) => s.auth.token;

export const selectAuthRole = (s: RootState) => s.auth.user?.role as Role | undefined;
export const selectIsViewOnly = (s: RootState) => selectAuthRole(s) === "ESS_VIEWER";
