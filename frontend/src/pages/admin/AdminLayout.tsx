import AdminSidebar from "../../components/Sidebar";
import AdminTopNav from "../../components/admin/AdminTopNav";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex w-full h-screen overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopNav />

        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
