import { useParams, Navigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import MyInfoPage from "../my-info/MyInfoPage";

export default function PimEmployeeMyInfoPage() {
  const { id } = useParams();

  if (!id) return <Navigate to="/pim" replace />;

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      {/* App Sidebar */}
      <Sidebar />

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* App Topbar */}
        <Topbar />

        {/* Page body */}
        <main className="flex-1 min-w-0">
          {/* MyInfoPage already contains its own left internal tabs + content */}
          <MyInfoPage employeeId={id} />
        </main>
      </div>
    </div>
  );
}
