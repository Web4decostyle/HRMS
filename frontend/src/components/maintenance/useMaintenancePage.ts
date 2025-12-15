import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useMaintenancePage(scope: string, nextPath: string) {
  const nav = useNavigate();
  const { state } = useLocation() as { state?: { maintenanceToken?: string } };
  const maintenanceToken = state?.maintenanceToken;

  useEffect(() => {
    // if user opened page directly or after tab click, enforce step-up auth
    if (!maintenanceToken) {
      nav(
        `/maintenance/auth?scope=${encodeURIComponent(
          scope
        )}&next=${encodeURIComponent(nextPath)}`,
        { replace: true }
      );
    }
  }, [maintenanceToken, nav, scope, nextPath]);

  return useMemo(() => ({ maintenanceToken }), [maintenanceToken]);
}
