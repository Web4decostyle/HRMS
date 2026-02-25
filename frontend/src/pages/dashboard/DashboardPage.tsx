// frontend/src/pages/dashboard/DashboardPage.tsx
import { useSelector } from "react-redux";
import { selectAuthRole } from "../../features/auth/selectors";

import EmployeeAttendanceWidget from "./widgets/EmployeeAttendanceWidget";
import MyActionSummaryWidget from "./widgets/MyActionSummaryWidget";
import QuickLaunchWidget from "./widgets/QuickLaunchWidget";
import BuzzLatestPostWidget from "./widgets/BuzzLatestPostWidget";
import EmployeesOnLeaveWidget from "./widgets/EmployeesOnLeaveWidget";
import EmployeeSubunitWidget from "./widgets/EmployeeSubunitWidget";
import EmployeeLocationWidget from "./widgets/EmployeeLocationWidget";

export default function DashboardPage() {
  const role = useSelector(selectAuthRole) ?? "ESS";
  const isAdminLike = role === "ADMIN" || role === "HR" || role === "SUPERVISOR";

  return (
    <div className="min-h-[calc(100vh-120px)]">
      {/*  2-column dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Row 1 */}
        <EmployeeAttendanceWidget />
        <MyActionSummaryWidget />

        {/* Row 2 */}
        <QuickLaunchWidget />
        <BuzzLatestPostWidget />

        {/* Admin-only widgets */}
        {isAdminLike ? (
          <>
            {/* Row 3 */}
            <EmployeesOnLeaveWidget />
            <EmployeeSubunitWidget />

            {/* Row 4 (left only like screenshot) */}
            <EmployeeLocationWidget />
            <div className="hidden lg:block" />
          </>
        ) : null}
      </div>
    </div>
  );
}