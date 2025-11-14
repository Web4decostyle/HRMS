// frontend/src/components/RequireAuth.tsx
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useMeQuery } from "../features/auth/authApi";

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Always call the hook, but skip when there's no token
  const { data, error, isLoading } = useMeQuery(undefined, {
    skip: !token,
  });

  // If there's no token at all → straight to login
  if (!token) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Token exists, but we are validating it with /auth/me
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-sm text-slate-600">
          Checking your session...
        </div>
      </div>
    );
  }

  // Error or no user → invalid token ⇒ clear & send to login
  if (error || !data?.user) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Token valid & /me returned a user
  return <>{children}</>;
}
