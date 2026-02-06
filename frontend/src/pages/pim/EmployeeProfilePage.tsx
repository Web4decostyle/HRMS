// frontend/src/pages/pim/EmployeeProfilePage.tsx
import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, ShieldAlert, UserRound } from "lucide-react";

import MyInfoPage from "../my-info/MyInfoPage";
import { selectAuthRole } from "../../features/auth/selectors";

function isAdminOrHr(role?: string | null) {
  const r = String(role || "").toUpperCase();
  return r === "ADMIN" || r === "HR";
}

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = useSelector(selectAuthRole);

  const allowed = useMemo(() => isAdminOrHr(role), [role]);

  if (!id) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-sm text-slate-500">
        Missing employee id.
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-[70vh] bg-[#f5f6fa] flex items-center justify-center px-6">
        <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-slate-800">
                Access denied
              </div>
              <div className="text-[12px] text-slate-500 mt-0.5">
                This page is only available for Admin and HR.
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-10 px-5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:opacity-95"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f6fa] min-h-screen">
      {/* Top header bar (small UX improvement) */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-9 w-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center"
              title="Back"
            >
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </button>

            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-[#fef4ea] text-[#f7941d] flex items-center justify-center">
                <UserRound className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-slate-800">
                  Employee Profile
                </div>
                <div className="text-[11px] text-slate-500">
                  Admin/HR view (PIM)
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500">
            Employee ID: <span className="font-semibold text-slate-700">{id}</span>
          </div>
        </div>
      </div>

      {/* Reuse your existing MyInfo UI in PIM mode */}
      <MyInfoPage employeeId={id} />
    </div>
  );
}
