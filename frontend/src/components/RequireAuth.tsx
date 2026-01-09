import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useMeQuery } from "../features/auth/authApi";
import { useAppDispatch } from "../app/hooks";
import { clearAuth } from "../features/auth/authSlice";

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();
  const dispatch = useAppDispatch();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const { data, error, isLoading } = useMeQuery(undefined, {
    skip: !token,
  });

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-sm text-slate-600">Checking your session...</div>
      </div>
    );
  }

  if (error || !data?.user) {
    dispatch(clearAuth());
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
