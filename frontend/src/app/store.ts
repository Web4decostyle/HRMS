// frontend/src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";

import authreducer from "../features/auth/authSlice";

import { authApi } from "../features/auth/authApi";
import { navigationApi } from "../features/navigation/navigationApi";
import { timeApi } from "../features/time/timeApi";
import { recruitmentApi } from "../features/recruitment/recruitmentApi";
import { performanceApi } from "../features/performance/performanceApi";
import { directoryApi } from "../features/directory/directoryApi";
import { buzzApi } from "../features/buzz/buzzApi";
import { adminApi } from "../features/admin/adminApi";
import { claimConfigApi } from "../features/claim/claimConfigApi";
import { claimApi } from "../features/claim/claimApi";
import { maintenanceApi } from "../features/maintenance/maintenanceApi";
import { helpApi } from "../features/help/helpApi";
import { leaveApi } from "../features/leave/leaveApi";
import { employeesApi } from "../features/employees/employeesApi";
import { pimApi } from "../features/pim/pimApi";
import { myInfoApi } from "../features/myInfo/myInfoApi";
import { configApi } from "../features/admin/configApi";
import { qualificationApiSlice } from "../features/qualifications/qualificationApiSlice";
import { pimConfigApi } from "../features/pim/pimConfigApi";
import { pimReportsApi } from "../features/pim/pimReportsApi";
import { dashboardApi } from "../features/dashboard/dashboardApi";
import { attendanceApi } from "../features/time/attendanceApi";
import { changeRequestsApi } from "../features/changeRequests/changeRequestsApi";
import { notificationsApi } from "../features/notifications/notificationsApi";
import { auditApi } from "../features/audit/auditApi";


export const store = configureStore({
  reducer: {
    // ✅ ADD THIS LINE (THIS IS WHAT FIXES "Property 'auth' does not exist")
    auth: authreducer,

    // RTK Query APIs
    [authApi.reducerPath]: authApi.reducer,
    [navigationApi.reducerPath]: navigationApi.reducer,
    [timeApi.reducerPath]: timeApi.reducer,
    [recruitmentApi.reducerPath]: recruitmentApi.reducer,
    [performanceApi.reducerPath]: performanceApi.reducer,
    [directoryApi.reducerPath]: directoryApi.reducer,
    [buzzApi.reducerPath]: buzzApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [claimApi.reducerPath]: claimApi.reducer,
    [claimConfigApi.reducerPath]: claimConfigApi.reducer,
    [maintenanceApi.reducerPath]: maintenanceApi.reducer,
    [helpApi.reducerPath]: helpApi.reducer,
    [leaveApi.reducerPath]: leaveApi.reducer,
    [employeesApi.reducerPath]: employeesApi.reducer,
    [pimApi.reducerPath]: pimApi.reducer,
    [myInfoApi.reducerPath]: myInfoApi.reducer,
    [configApi.reducerPath]: configApi.reducer,
    [qualificationApiSlice.reducerPath]: qualificationApiSlice.reducer,
    [pimConfigApi.reducerPath]: pimConfigApi.reducer,
    [pimReportsApi.reducerPath]: pimReportsApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    [changeRequestsApi.reducerPath]: changeRequestsApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [auditApi.reducerPath]: auditApi.reducer,

  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      navigationApi.middleware,
      timeApi.middleware,
      recruitmentApi.middleware,
      performanceApi.middleware,
      directoryApi.middleware,
      buzzApi.middleware,
      adminApi.middleware,
      claimApi.middleware,
      claimConfigApi.middleware,
      maintenanceApi.middleware,
      helpApi.middleware,
      leaveApi.middleware,
      employeesApi.middleware,
      pimApi.middleware,
      myInfoApi.middleware,
      configApi.middleware,
      qualificationApiSlice.middleware,
      pimConfigApi.middleware,
      pimReportsApi.middleware,
      dashboardApi.middleware,
      attendanceApi.middleware,
      changeRequestsApi.middleware,
      notificationsApi.middleware,
      auditApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
