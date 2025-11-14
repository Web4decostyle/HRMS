// frontend/src/pages/dashboard/DashboardPage.tsx
import EmployeeAttendanceWidget from "./widgets/EmployeeAttendanceWidget";
import MyActionSummaryWidget from "./widgets/MyActionSummaryWidget";
import QuickLaunchWidget from "./widgets/QuickLaunchWidget";
import BuzzLatestPostWidget from "./widgets/BuzzLatestPostWidget";
import EmployeesOnLeaveWidget from "./widgets/EmployeesOnLeaveWidget";
import EmployeeSubunitWidget from "./widgets/EmployeeSubunitWidget";
import EmployeeLocationWidget from "./widgets/EmployeeLocationWidget";
import { useMeQuery } from "../../features/auth/authApi";

export default function DashboardPage() {
  const { data } = useMeQuery();

  const userName = data?.user
    ? `${data.user.firstName} ${data.user.lastName}`
    : "User";

  return (
    <div className="space-y-6">
      {/* Header / greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back, {userName}. Here’s what’s happening in your organization today.
        </p>
      </div>

      {/* Widgets grid – matches DecoStyle dashboard layout */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <EmployeeAttendanceWidget />
        <MyActionSummaryWidget />
        <QuickLaunchWidget />
        <BuzzLatestPostWidget />
        <EmployeesOnLeaveWidget />
        <EmployeeSubunitWidget />
        <EmployeeLocationWidget />
      </div>
    </div>
  );
}
