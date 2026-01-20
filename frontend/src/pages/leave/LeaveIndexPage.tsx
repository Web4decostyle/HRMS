import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuthRole } from "../../features/auth/selectors";

/**
 * Landing route for /leave.
 * - ESS: can apply leave + view their own leave
 * - SUPERVISOR/HR/ADMIN: see approval list
 * - ESS_VIEWER: view-only -> send to My Leave
 */
export default function LeaveIndexPage() {
  const role = useSelector(selectAuthRole) ?? "ESS";

  if (role === "ESS_VIEWER") {
    return <Navigate to="/leave/my-leave" replace />;
  }

  const isApprover = role === "ADMIN" || role === "HR" || role === "SUPERVISOR";
  return <Navigate to={isApprover ? "/leave/list" : "/leave/apply"} replace />;
}
