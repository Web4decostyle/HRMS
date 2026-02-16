// frontend/src/pages/dashboard/DashboardPage.tsx
import EmployeeAttendanceWidget from "./widgets/EmployeeAttendanceWidget";
import MyActionSummaryWidget from "./widgets/MyActionSummaryWidget";
import QuickLaunchWidget from "./widgets/QuickLaunchWidget";
import BuzzLatestPostWidget from "./widgets/BuzzLatestPostWidget";
import EmployeesOnLeaveWidget from "./widgets/EmployeesOnLeaveWidget";
import EmployeeSubunitWidget from "./widgets/EmployeeSubunitWidget";
import EmployeeLocationWidget from "./widgets/EmployeeLocationWidget";

export default function DashboardPage() {
  return (
    <div className="min-h-[calc(100vh-120px)] px-3 sm:px-4 lg:px-0">
      {/* ✅ responsive grid: 1 col on mobile, 2 cols on large */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Row 1 */}
        <EmployeeAttendanceWidget />
        <MyActionSummaryWidget />

        {/* Row 2 */}
        <QuickLaunchWidget />
        <BuzzLatestPostWidget />

        {/* Row 3 */}
        <EmployeesOnLeaveWidget />
        <EmployeeSubunitWidget />

        {/* Row 4 (left only on desktop, full width on mobile) */}
        <div className="lg:col-span-1">
          <EmployeeLocationWidget />
        </div>
        <div className="hidden lg:block" />
      </div>
    </div>
  );
}
