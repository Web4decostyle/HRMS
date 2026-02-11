import React from "react";
import Topbar from "../../components/Topbar";
import { useMeQuery } from "../../features/auth/authApi";
import Sidebar from "../../components/Sidebar";

const rowLabelCls = "text-[12px] text-slate-500";
const rowValueCls = "text-[13px] text-slate-800 font-medium";

export default function ProfilePage() {
  const { data } = useMeQuery();

  const user: any = data?.user;

  const fullName: string =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.fullName ||
    user?.name ||
    user?.username ||
    "User";

  // If you have company/org fields in backend, map them here.
  // Fallbacks keep UI safe.
  const companyName =
    user?.company?.name ||
    user?.organization?.name ||
    user?.tenant?.name ||
    "SATISFACTION PRODUCTS PVT LTD";

  const companyAddress =
    user?.company?.address ||
    user?.organization?.address ||
    user?.tenant?.address ||
    "Survey No. 155/3 & 156/2, BRG Industrial Park Gram Malikhedi, Nemawar Road Indore Madhya Pradesh 452016, Indore, Madhya Pradesh, India 452016";

  const email = user?.email || "—";
  const phone = user?.phone || user?.mobile || "—";

  // Put whatever you store for expiry (subscription/licence/etc)
  const expiry =
    user?.expiryDate ||
    user?.licenseExpiry ||
    user?.subscriptionExpiry ||
    "—";

return (
  <div className="min-h-screen bg-slate-50">
    <Topbar active="profile" />

    {/* ✅ Body layout: Sidebar + Page */}
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content (pushes right of sidebar) */}
      <main className="flex-1 px-6 pt-5 pb-8">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-600 via-slate-500 to-sky-300 h-[120px]">
          <div className="absolute right-0 bottom-0 opacity-20 flex gap-2 pr-6 pb-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-3 rounded-sm bg-white"
                style={{ height: 18 + i * 4 }}
              />
            ))}
          </div>

          <div className="absolute inset-0 bg-black/10" />

          <div className="relative p-6 text-white">
            <div className="text-[22px] font-bold tracking-wide uppercase">
              {companyName}
            </div>
            <div className="mt-1 text-[13px] opacity-90">{companyAddress}</div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 pt-4 flex items-center justify-between">
            <div className="text-[16px] font-semibold text-slate-800">
              User Details
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 h-9 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 text-sm font-medium"
              onClick={() => alert("Hook this to your edit flow")}
            >
              ✏️ Edit
            </button>
          </div>

          <div className="px-5 mt-3">
            <div className="flex items-end gap-8">
              <button
                type="button"
                className="text-[13px] font-semibold text-slate-700 pb-2 border-b-2 border-blue-600"
              >
                User Information
              </button>
            </div>
          </div>

          <div className="px-5 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10 max-w-3xl">
              <div className="flex items-center justify-between gap-4">
                <div className={rowLabelCls}>Email</div>
                <div className="flex items-center gap-2">
                  <div className={rowValueCls}>{email}</div>
                  <span className="inline-flex w-3 h-3 rounded-full bg-green-500" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className={rowLabelCls}>Mobile Number</div>
                <div className="flex items-center gap-2">
                  <div className={rowValueCls}>{phone}</div>
                  <span className="inline-flex w-3 h-3 rounded-full bg-green-500" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className={rowLabelCls}>Expiry Date</div>
                <div className={rowValueCls}>{expiry}</div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className={rowLabelCls}>Name</div>
                <div className={rowValueCls}>{fullName}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-10" />
      </main>
    </div>
  </div>
);
}
