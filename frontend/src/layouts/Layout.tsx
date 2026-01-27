// frontend/src/layouts/Layout.tsx
import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ViewOnlyGuard from "../components/ViewOnlyGuard";

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <div className="min-h-screen flex bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="p-6 min-w-0">
          <ViewOnlyGuard>{children}</ViewOnlyGuard>
        </main>
      </div>
    </div>
  );
}
