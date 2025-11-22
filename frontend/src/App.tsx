import { Routes, Route, Navigate } from "react-router-dom";

// Auth
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import RequireAuth from "./components/RequireAuth";

// Layouts
import Layout from "./layouts/Layout";
import AdminLayout from "./pages/admin/AdminLayout";

// Dashboard
import DashboardPage from "./pages/dashboard/DashboardPage";

// PIM
import EmployeesPage from "./pages/employees/PimPage";
import AddEmployeePage from "./pages/employees/AddEmployeePage";

// My Info
import MyInfoPage from "./pages/my-info/MyInfoPage";

// Leave
import LeaveListPage from "./pages/leave/LeaveListPage";
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

// Time, Org, Recruitment, Performance, Directory, Claim, Buzz, Maintenance
import TimePage from "./pages/time/TimePage";
import RecruitmentPage from "./pages/recruitment/RecruitmentPage";
import PerformancePage from "./pages/performance/PerformancePage";
import DirectoryPage from "./pages/directory/DirectoryPage";
import ClaimPage from "./pages/claim/ClaimPage";
import BuzzPage from "./pages/buzz/BuzzPage";
import SystemInfoPage from "./pages/maintenance/SystemInfoPage";

// Admin Pages (Job)
import JobTitlesPage from "./pages/admin/job/JobTitlesPage";
import PayGradesPage from "./pages/admin/job/PayGradesPage";
import EmploymentStatusPage from "./pages/admin/job/EmploymentStatusPage";
import JobCategoriesPage from "./pages/admin/job/JobCategoriesPage";
import WorkShiftsPage from "./pages/admin/job/WorkShiftsPage";

// Admin Pages (Organization)
import GeneralInfoPage from "./pages/admin/organization/GeneralInfoPage";
import LocationsPage from "./pages/admin/organization/LocationsPage";
import OrgStructurePage from "./pages/admin/organization/OrgStructurePage";

// Admin Pages (Qualifications)
import SkillsPage from "./pages/admin/qualifications/SkillsPage";
// import EducationPage from "./pages/admin/qualifications/EducationPage";
// import LanguagesPage from "./pages/admin/qualifications/LanguagesPage";
// import LicensesPage from "./pages/admin/qualifications/LicensesPage";

// Admin Pages (Nationalities)
import NationalitiesPage from "./pages/admin/nationalities/NationalitiesPage";

// Admin Pages (User Management)
import SystemUsersPage from "./pages/admin/user-management/SystemUsersPage";

import EmailConfigPage from "./pages/admin/config/EmailConfigPage";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Dashboard */}
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

      {/* My Info */}
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

      {/* Time */}
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

      {/* Recruitment */}
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

      {/* Performance */}
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

      {/* Directory */}
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

      {/* Claim */}
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

      {/* Buzz */}
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

      {/* Maintenance */}
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

      {/* PIM */}
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

      {/* Leave */}
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

      {/* ================= ADMIN (MAIN) ================= */}
      <Route
        path="/admin/*"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        {/* Default */}
        <Route index element={<SystemUsersPage />} />
        <Route path="user-management" element={<SystemUsersPage />} />

        {/* Job */}
        <Route path="job/job-titles" element={<JobTitlesPage />} />
        <Route path="job/pay-grades" element={<PayGradesPage />} />
        <Route
          path="job/employment-status"
          element={<EmploymentStatusPage />}
        />
        <Route path="job/job-categories" element={<JobCategoriesPage />} />
        <Route path="job/work-shifts" element={<WorkShiftsPage />} />

        {/* Organization */}
        <Route path="org/general-info" element={<GeneralInfoPage />} />
        <Route path="org/locations" element={<LocationsPage />} />
        <Route path="org/structure" element={<OrgStructurePage />} />

        {/* Qualifications */}
        <Route path="qualifications/skills" element={<SkillsPage />} />
        {/* <Route path="qualifications/education" element={<EducationPage />} />
        <Route path="qualifications/languages" element={<LanguagesPage />} />
        <Route path="qualifications/licenses" element={<LicensesPage />} /> */}

        {/* Nationalities */}
        <Route path="nationalities" element={<NationalitiesPage />} />

        {/* Configurations */}
        <Route path="configuration/email-config" element={<EmailConfigPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
