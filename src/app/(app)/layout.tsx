import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar, Breadcrumbs } from "@/components/layout/app-topbar";

// TODO(ตัง): protect these routes — redirect to /login when there is no session.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar className="hidden lg:flex" />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar />
        <main className="flex-1 px-6 py-6">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
