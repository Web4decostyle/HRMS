// frontend/src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import EmployeesPage from "./pages/employees/PimPage";
import Layout from "./layouts/Layout";
import RequireAuth from "./components/RequireAuth";

import AdminPage from "./pages/admin/AdminPage";
import TimePage from "./pages/time/TimePage";
import RecruitmentPage from "./pages/recruitment/RecruitmentPage";
import PerformancePage from "./pages/performance/PerformancePage";
import DirectoryPage from "./pages/directory/DirectoryPage";
import ClaimPage from "./pages/claim/ClaimPage";
import BuzzPage from "./pages/buzz/BuzzPage";
import SystemInfoPage from "./pages/maintenance/SystemInfoPage";
import MyInfoPage from "./pages/my-info/MyInfoPage";
import LeaveListPage from "./pages/leave/LeaveListPage";
import AddEmployeePage from "./pages/employees/AddEmployeePage";

import AddLeaveEntitlementPage from "./pages/leave/AddLeaveEntitlementPage";
import EmployeeEntitlementsPage from "./pages/leave/EmployeeEntitlementsPage";
import MyEntitlementsPage from "./pages/leave/MyEntitlementsPage";
import ApplyLeavePage from "./pages/leave/ApplyLeavePage";
import MyLeavePage from "./pages/leave/MyLeavePage";
import AssignLeavePage from "./pages/leave/AssignLeavePage";
import LeavePeriodPage from "./pages/leave/LeavePeriodPage";
import LeaveTypesPage from "./pages/leave/LeaveTypesPage";
import WorkWeekPage from "./pages/leave/WorkWeekPage";
import HolidaysPage from "./pages/leave/HolidaysPage";

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected: dashboard */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout>
              <DashboardPage />
            </Layout>
          </RequireAuth>
        }
      />

      <Route
        path="/admin"
        element={
          <RequireAuth>
            <Layout>
              <AdminPage />
            </Layout>
          </RequireAuth>
        }
      />

      <Route
        path="/time"
        element={
          <RequireAuth>
            <Layout>
              <TimePage />
            </Layout>
          </RequireAuth>
        }
      />

      <Route
        path="/recruitment"
        element={
          <RequireAuth>
            <Layout>
              <RecruitmentPage />
            </Layout>
          </RequireAuth>
        }
      />

      <Route
        path="/performance"
        element={
          <RequireAuth>
            <Layout>
              <PerformancePage />
            </Layout>
          </RequireAuth>
        }
      />

      <Route
        path="/directory"
        element={
          <RequireAuth>
            <Layout>
              <DirectoryPage />
            </Layout>
          </RequireAuth>
        }
      />

      <Route
        path="/claim"
        element={
          <RequireAuth>
            <Layout>
              <ClaimPage />
            </Layout>
          </RequireAuth>
        }
      />

      <Route
        path="/buzz"
        element={
          <RequireAuth>
            <Layout>
              <BuzzPage />
            </Layout>
          </RequireAuth>
        }
      />

      <Route
        path="/maintenance"
        element={
          <RequireAuth>
            <Layout>
              <SystemInfoPage />
            </Layout>
          </RequireAuth>
        }
      />

      {/* ✅ fixed route */}
      <Route
        path="/my-info"
        element={
          <RequireAuth>
            <Layout>
              <MyInfoPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/leave"
        element={
          <RequireAuth>
            <Layout>
              <LeaveListPage />
            </Layout>
          </RequireAuth>
        }
      />

      {/* Protected: employees */}
      <Route
        path="/pim"
        element={
          <RequireAuth>
            <Layout>
              <EmployeesPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/employees/add"
        element={
          <RequireAuth>
            <Layout>
              <AddEmployeePage />
            </Layout>
          </RequireAuth>
        }
      />

      <Route
        path="/leave/entitlements/add"
        element={<AddLeaveEntitlementPage />}
      />
      <Route
        path="/leave/entitlements/employee"
        element={<EmployeeEntitlementsPage />}
      />
      <Route path="/leave/entitlements/my" element={<MyEntitlementsPage />} />

      <Route path="/leave/apply" element={<ApplyLeavePage />} />
      <Route path="/leave/my-leave" element={<MyLeavePage />} />
      <Route path="/leave/assign" element={<AssignLeavePage />} />
      <Route path="/leave/config/period" element={<LeavePeriodPage />} />
      <Route path="/leave/config/types" element={<LeaveTypesPage />} />
      <Route path="/leave/config/work-week" element={<WorkWeekPage />} />
      <Route path="/leave/config/holidays" element={<HolidaysPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
