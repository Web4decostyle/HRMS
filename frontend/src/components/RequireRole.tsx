import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuthRole } from "../features/auth/selectors";

type Role = "ADMIN" | "HR" | "SUPERVISOR" | "ESS" | "ESS_VIEWER";

export default function RequireRole({
  allowed,
  children,
}: {
  allowed: Role[];
  children: ReactNode;
}) {
  const location = useLocation();
  const role = useSelector(selectAuthRole) as Role | undefined;

  if (!role || !allowed.includes(role)) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
