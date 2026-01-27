import React from "react";
import { useSelector } from "react-redux";
import { selectIsViewOnly } from "../features/auth/selectors";

export default function ViewOnlyGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const isViewOnly = useSelector(selectIsViewOnly);

  return (
    <div className={isViewOnly ? "view-only-scope" : ""}>
      {isViewOnly && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-800">
          <b>View-only mode:</b> You can browse and view information, but you
          can’t make changes.
        </div>
      )}

      {children}
    </div>
  );
}
