// frontend/src/pages/maintenance/MaintenanceEntryPage.tsx
import { Navigate } from "react-router-dom";

export default function MaintenanceEntryPage() {
  return (
    <Navigate
      to="/maintenance/auth?scope=purge-employee&next=/maintenance/purge-records"
      replace
    />
  );
}
