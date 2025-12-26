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
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6">
          <ViewOnlyGuard>{children}</ViewOnlyGuard>
        </main>
      </div>
    </div>
  );
}
