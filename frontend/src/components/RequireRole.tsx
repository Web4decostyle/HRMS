import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useMeQuery } from "../features/auth/authApi";

type Role = "ADMIN" | "HR" | "SUPERVISOR" | "ESS" | "ESS_VIEWER";

export default function RequireRole({
  allowed,
  children,
}: {
  allowed: Role[];
  children: ReactNode;
}) {
  const location = useLocation();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const { data, isLoading } = useMeQuery(undefined, { skip: !token });

  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-sm text-slate-600">Loading...</div>
      </div>
    );
  }

  const role = data?.user?.role as Role | undefined;
  if (!role || !allowed.includes(role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
