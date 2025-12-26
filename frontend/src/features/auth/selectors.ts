import { RootState } from "../../app/store";

export const selectAuthUser = (s: RootState) => (s as any).auth?.user;

export const selectAuthRole = (s: RootState) =>
  ((s as any).auth?.user?.role as
    | "ADMIN"
    | "HR"
    | "ESS"
    | "ESS_VIEWER"
    | undefined);

export const selectIsViewOnly = (s: RootState) => selectAuthRole(s) === "ESS_VIEWER";
