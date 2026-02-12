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
import EmployeesPage from "./pages/pim/PimPage";
import AddEmployeePage from "./pages/pim/AddEmployeePage";
import PimReportsPage from "./pages/pim/PimReportsPage";
import AddPimReportPage from "./pages/pim/AddPimReportPage";
import PimEmployeeMyInfoPage from "./pages/pim/PimEmployeeMyInfoPage";

// My Info
import MyInfoPage from "./pages/my-info/MyInfoPage";

// Leave
import LeaveIndexPage from "./pages/leave/LeaveIndexPage";
import LeaveListPage from "./pages/leave/LeaveListPage";
import ApplyLeavePage from "./pages/leave/ApplyLeavePage";
import MyLeavePage from "./pages/leave/MyLeavePage";
import AssignLeavePage from "./pages/leave/AssignLeavePage";
import LeavePeriodPage from "./pages/leave/LeavePeriodPage";
import LeaveTypesPage from "./pages/leave/LeaveTypesPage";
import WorkWeekPage from "./pages/leave/WorkWeekPage";
import HolidaysPage from "./pages/leave/HolidaysPage";

// Time
import MyTimesheetsPage from "./pages/time/MyTimesheetsPage";
import MyTimesheetViewPage from "./pages/time/MyTimesheetViewPage";
import EditTimesheetPage from "./pages/time/EditTimesheetPage";
import PunchInPage from "./pages/time/attendance/PunchInPage";
import MyAttendanceRecordsPage from "./pages/time/MyAttendanceRecordsPage";

// Recruitment
import RecruitmentPage from "./pages/recruitment/RecruitmentPage";
import VacanciesPage from "./pages/recruitment/VacanciesPage";
import CandidatesPage from "./pages/recruitment/CandidatesPage";

// Performance
import PerformancePage from "./pages/performance/PerformancePage";
import ConfigureKpisPage from "./pages/performance/ConfigureKpisPage";
import ConfigureTrackersPage from "./pages/performance/ConfigureTrackersPage";
import ManageReviewsPage from "./pages/performance/ManageReviewsPage";
import AddReviewPage from "./pages/performance/AddReviewPage";
import ViewReviewPage from "./pages/performance/ViewReviewPage";
import EditReviewPage from "./pages/performance/EditReviewPage";
import MyReviewsPage from "./pages/performance/MyReviewsPage";
import EmployeeReviewsPage from "./pages/performance/EmployeeReviewsPage";
import MyTrackersPage from "./pages/performance/MyTrackersPage";
import EmployeeTrackersPage from "./pages/performance/EmployeeTrackersPage";

// Directory, Claim, Buzz
import DirectoryPage from "./pages/directory/DirectoryPage";
import ClaimPage from "./pages/claim/ClaimPage";
import BuzzPage from "./pages/buzz/BuzzPage";

// Maintenance
import MaintenanceEntryPage from "./pages/maintenance/MaintenanceEntryPage";
import MaintenanceAuthPage from "./pages/maintenance/MaintenanceAuthPage";
import SystemInfoPage from "./pages/maintenance/SystemInfoPage";
import PurgeRecordsPage from "./pages/maintenance/PurgeRecordsPage";
import PurgeCandidateRecordsPage from "./pages/maintenance/PurgeCandidateRecordsPage";
import AccessRecordsPage from "./pages/maintenance/AccessRecordsPage";

// Admin - Job
import JobTitlesPage from "./pages/admin/job/JobTitlesPage";
import AddJobTitlePage from "./pages/admin/job/AddJobTitlePage";
import PayGradesPage from "./pages/admin/job/PayGradesPage";
import EmploymentStatusPage from "./pages/admin/job/EmploymentStatusPage";
import AddEmploymentStatusPage from "./pages/admin/job/AddEmploymentStatusPage";
import JobCategoriesPage from "./pages/admin/job/JobCategoriesPage";
import AddJobCategoryPage from "./pages/admin/job/AddJobCategoryPage";
import WorkShiftsPage from "./pages/admin/job/WorkShiftsPage";

// Admin - Organization
import GeneralInfoPage from "./pages/admin/organization/GeneralInfoPage";
import LocationsPage from "./pages/admin/organization/LocationsPage";
import OrgStructurePage from "./pages/admin/organization/OrgStructurePage";

// Admin - Qualifications
import SkillsPage from "./pages/admin/qualifications/SkillsPage";
import AddSkillPage from "./pages/admin/qualifications/AddSkillPage";
import EducationPage from "./pages/admin/qualifications/EducationPage";
import LanguagesPage from "./pages/admin/qualifications/LanguagesPage";
import LicensesPage from "./pages/admin/qualifications/LicensesPage";

// Admin - Nationalities + Users + Config
import NationalitiesPage from "./pages/admin/nationalities/NationalitiesPage";
import SystemUsersPage from "./pages/admin/user-management/SystemUsersPage";
import EmailConfigPage from "./pages/admin/config/EmailConfigPage";

// PIM Config
import OptionalFieldsPage from "./pages/pim/config/OptionalFieldsPage";
import CustomFieldsListPage from "./pages/pim/config/CustomFieldsListPage";
import AddCustomFieldPage from "./pages/pim/config/AddCustomFieldPage";
import DataImportPage from "./pages/pim/config/DataImportPage";
import ReportingMethodsPage from "./pages/pim/config/ReportingMethodsPage";
import AddReportingMethodPage from "./pages/pim/config/AddReportingMethodPage";
import TerminationReasonsPage from "./pages/pim/config/TerminationReasonsPage";

// ✅ Approvals
import RequireRole from "./components/RequireRole";
import AdminApprovalsPage from "./pages/admin/approvals/AdminApprovalsPage";

// ✅ Notifications page
import NotificationsPage from "./pages/notifications/NotificationsPage";
import AdminAuditHistoryPage from "./pages/admin/AdminAuditHistoryPage";
import LeaveRequestViewPage from "./pages/leave/LeaveRequestViewPage";
import DivisionsPage from "./pages/divisions/DivisionsPage";
import EmployeeProfilePage from "./pages/pim/EmployeeProfilePage";
import EditJobTitlePage from "./pages/admin/job/EditJobTitlePage";

// Profile page
import ProfilePage from "./pages/profile/ProfilePage";

export default function App() {
  return (
    <Routes>
      {/* ===================== PUBLIC ===================== */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ===================== APP (MAIN LAYOUT) ===================== */}
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
        path="/divisions"
        element={
          <RequireAuth>
            <RequireRole allowed={["ADMIN", "HR"]}>
              <Layout>
                <DivisionsPage />
              </Layout>
            </RequireRole>
          </RequireAuth>
        }
      />

      {/* ✅ Notifications (TOP LEVEL - NOT inside /admin/*) */}
      <Route
        path="/notifications"
        element={
          <RequireAuth>
            <Layout>
              <NotificationsPage />
            </Layout>
          </RequireAuth>
        }
      />

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

      {/* ===================== TIME ===================== */}
      <Route
        path="/time"
        element={
          <RequireAuth>
            <Layout>
              <MyTimesheetsPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/time/timesheets/:id"
        element={
          <RequireAuth>
            <Layout>
              <MyTimesheetViewPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/time/timesheets/:id/edit"
        element={
          <RequireAuth>
            <Layout>
              <EditTimesheetPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/time/attendance/punch-in"
        element={
          <RequireAuth>
            <Layout>
              <PunchInPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/time/attendance/my-records"
        element={
          <RequireAuth>
            <Layout>
              <MyAttendanceRecordsPage />
            </Layout>
          </RequireAuth>
        }
      />

      {/* ===================== Profile Page ===================== */}
      <Route path="/profile" element={<ProfilePage />} />

      {/* ===================== RECRUITMENT ===================== */}
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
        path="/recruitment/vacancies"
        element={
          <RequireAuth>
            <Layout>
              <VacanciesPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/recruitment/candidates/add"
        element={
          <RequireAuth>
            <Layout>
              <CandidatesPage />
            </Layout>
          </RequireAuth>
        }
      />

      {/* ===================== PERFORMANCE ===================== */}
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
        path="/performance/configure/kpis"
        element={
          <RequireAuth>
            <ConfigureKpisPage />
          </RequireAuth>
        }
      />
      <Route
        path="/performance/configure/trackers"
        element={
          <RequireAuth>
            <ConfigureTrackersPage />
          </RequireAuth>
        }
      />
      <Route
        path="/performance/manage/reviews"
        element={
          <RequireAuth>
            <ManageReviewsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/performance/manage/add"
        element={
          <RequireAuth>
            <AddReviewPage />
          </RequireAuth>
        }
      />
      <Route
        path="/performance/manage/reviews/:id"
        element={
          <RequireAuth>
            <ViewReviewPage />
          </RequireAuth>
        }
      />
      <Route
        path="/performance/manage/reviews/:id/edit"
        element={
          <RequireAuth>
            <EditReviewPage />
          </RequireAuth>
        }
      />
      <Route
        path="/performance/my-reviews"
        element={
          <RequireAuth>
            <MyReviewsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/performance/employee-reviews"
        element={
          <RequireAuth>
            <EmployeeReviewsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/performance/my-trackers"
        element={
          <RequireAuth>
            <MyTrackersPage />
          </RequireAuth>
        }
      />
      <Route
        path="/performance/employee-trackers"
        element={
          <RequireAuth>
            <EmployeeTrackersPage />
          </RequireAuth>
        }
      />

      {/* ===================== DIRECTORY / CLAIM / BUZZ ===================== */}
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

      {/* ===================== MAINTENANCE ===================== */}
      <Route
        path="/maintenance"
        element={
          <RequireAuth>
            <MaintenanceEntryPage />
          </RequireAuth>
        }
      />
      <Route
        path="/maintenance/auth"
        element={
          <RequireAuth>
            <MaintenanceAuthPage />
          </RequireAuth>
        }
      />
      <Route
        path="/maintenance/system-info"
        element={
          <RequireAuth>
            <Layout>
              <SystemInfoPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/maintenance/purge-records"
        element={
          <RequireAuth>
            <Layout>
              <PurgeRecordsPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/maintenance/purge-candidate-records"
        element={
          <RequireAuth>
            <Layout>
              <PurgeCandidateRecordsPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/maintenance/access-records"
        element={
          <RequireAuth>
            <Layout>
              <AccessRecordsPage />
            </Layout>
          </RequireAuth>
        }
      />

      {/* ===================== PIM ===================== */}
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
        path="/employees/:id"
        element={
          <RequireAuth>
            <Layout>
              <EmployeeProfilePage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/pim/employee/:id"
        element={
          <RequireAuth>
            <PimEmployeeMyInfoPage />
          </RequireAuth>
        }
      />
      <Route
        path="/pim/reports"
        element={
          <RequireAuth>
            <Layout>
              <PimReportsPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/pim/reports/add"
        element={
          <RequireAuth>
            <Layout>
              <AddPimReportPage />
            </Layout>
          </RequireAuth>
        }
      />

      {/* ===================== LEAVE ===================== */}
      <Route
        path="/leave"
        element={
          <RequireAuth>
            <Layout>
              <LeaveIndexPage />
            </Layout>
          </RequireAuth>
        }
      />

      {/* Approver list (Supervisor -> HR approvals) */}
      <Route
        path="/leave/list"
        element={
          <RequireAuth>
            <Layout>
              <RequireRole allowed={["ADMIN", "HR", "SUPERVISOR"]}>
                <LeaveListPage />
              </RequireRole>
            </Layout>
          </RequireAuth>
        }
      />

      <Route
        path="/leave/list/:id"
        element={
          <RequireAuth>
            <Layout>
              <RequireRole allowed={["ADMIN", "HR", "SUPERVISOR"]}>
                <LeaveRequestViewPage />
              </RequireRole>
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/leave/apply"
        element={
          <RequireAuth>
            <Layout>
              <ApplyLeavePage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/leave/my-leave"
        element={
          <RequireAuth>
            <Layout>
              <MyLeavePage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/leave/assign"
        element={
          <RequireAuth>
            <Layout>
              <RequireRole allowed={["ADMIN", "HR"]}>
                <AssignLeavePage />
              </RequireRole>
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/leave/config/period"
        element={
          <RequireAuth>
            <Layout>
              <RequireRole allowed={["ADMIN", "HR"]}>
                <LeavePeriodPage />
              </RequireRole>
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/leave/config/types"
        element={
          <RequireAuth>
            <Layout>
              <RequireRole allowed={["ADMIN", "HR"]}>
                <LeaveTypesPage />
              </RequireRole>
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/leave/config/work-week"
        element={
          <RequireAuth>
            <Layout>
              <RequireRole allowed={["ADMIN", "HR"]}>
                <WorkWeekPage />
              </RequireRole>
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/leave/config/holidays"
        element={
          <RequireAuth>
            <Layout>
              <RequireRole allowed={["ADMIN", "HR"]}>
                <HolidaysPage />
              </RequireRole>
            </Layout>
          </RequireAuth>
        }
      />

      {/* ===================== PIM CONFIG ===================== */}
      <Route
        path="/pim/config/optional-fields"
        element={
          <RequireAuth>
            <Layout>
              <OptionalFieldsPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/pim/config/custom-fields"
        element={
          <RequireAuth>
            <Layout>
              <CustomFieldsListPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/pim/config/custom-fields/add"
        element={
          <RequireAuth>
            <Layout>
              <AddCustomFieldPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/pim/config/data-import"
        element={
          <RequireAuth>
            <Layout>
              <DataImportPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/pim/config/reporting-methods"
        element={
          <RequireAuth>
            <Layout>
              <ReportingMethodsPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/pim/config/reporting-methods/add"
        element={
          <RequireAuth>
            <Layout>
              <AddReportingMethodPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/pim/config/termination-reasons"
        element={
          <RequireAuth>
            <Layout>
              <TerminationReasonsPage />
            </Layout>
          </RequireAuth>
        }
      />

      {/* ===================== ADMIN (NESTED) ===================== */}
      <Route
        path="/admin/*"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<SystemUsersPage />} />
        <Route path="user-management" element={<SystemUsersPage />} />

        <Route
          path="approvals"
          element={
            <RequireRole allowed={["ADMIN"]}>
              <AdminApprovalsPage />
            </RequireRole>
          }
        />

        <Route
          path="history"
          element={
            <RequireRole allowed={["ADMIN"]}>
              <AdminAuditHistoryPage />
            </RequireRole>
          }
        />

        {/* Job */}
        <Route path="job/job-titles" element={<JobTitlesPage />} />
        <Route path="job/job-titles/add" element={<AddJobTitlePage />} />
        <Route path="job/job-titles/:id/edit" element={<EditJobTitlePage />} />

        <Route path="job/pay-grades" element={<PayGradesPage />} />
        <Route
          path="job/employment-status"
          element={<EmploymentStatusPage />}
        />
        <Route
          path="job/employment-status/add"
          element={<AddEmploymentStatusPage />}
        />
        <Route path="job/job-categories" element={<JobCategoriesPage />} />
        <Route path="job/job-categories/add" element={<AddJobCategoryPage />} />
        <Route path="job/work-shifts" element={<WorkShiftsPage />} />

        {/* Org */}
        <Route path="org/general-info" element={<GeneralInfoPage />} />
        <Route path="org/locations" element={<LocationsPage />} />
        <Route path="org/structure" element={<OrgStructurePage />} />

        {/* Qualifications */}
        <Route path="qualifications/skills" element={<SkillsPage />} />
        <Route path="qualifications/skills/add" element={<AddSkillPage />} />
        <Route path="qualifications/education" element={<EducationPage />} />
        <Route path="qualifications/languages" element={<LanguagesPage />} />
        <Route path="qualifications/licenses" element={<LicensesPage />} />

        {/* Nationalities + Config */}
        <Route path="nationalities" element={<NationalitiesPage />} />
        <Route
          path="configuration/email-config"
          element={<EmailConfigPage />}
        />
      </Route>

      {/* ===================== FALLBACK ===================== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
