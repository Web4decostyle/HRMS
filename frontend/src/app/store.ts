// frontend/src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../features/auth/authApi";
import { navigationApi } from "../features/navigation/navigationApi";
import { timeApi } from "../features/time/timeApi";
import { recruitmentApi } from "../features/recruitment/recruitmentApi";
import { performanceApi } from "../features/performance/performanceApi";
import { directoryApi } from "../features/directory/directoryApi";
import { buzzApi } from "../features/buzz/buzzApi";
import { adminApi } from "../features/admin/adminApi";
import { claimApi } from "../features/claim/claimApi";
import { maintenanceApi } from "../features/maintenance/maintenanceApi";
import { helpApi } from "../features/help/helpApi";
import { leaveApi } from "../features/leave/leaveApi";
import { employeesApi } from "../features/employees/employeesApi";
import { pimApi } from "../features/pim/pimApi";



export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [navigationApi.reducerPath]: navigationApi.reducer,
    [timeApi.reducerPath]: timeApi.reducer,
    [recruitmentApi.reducerPath]: recruitmentApi.reducer,
    [performanceApi.reducerPath]: performanceApi.reducer,
    [directoryApi.reducerPath]: directoryApi.reducer,
    [buzzApi.reducerPath]: buzzApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [claimApi.reducerPath]: claimApi.reducer,
    [maintenanceApi.reducerPath]: maintenanceApi.reducer,
    [helpApi.reducerPath]: helpApi.reducer,
    [leaveApi.reducerPath]: leaveApi.reducer,
    [employeesApi.reducerPath]: employeesApi.reducer,
    [pimApi.reducerPath]: pimApi.reducer,

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
      maintenanceApi.middleware,
      helpApi.middleware,
      leaveApi.middleware,
      employeesApi.middleware,
      pimApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
