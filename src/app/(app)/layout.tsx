import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar, Breadcrumbs } from "@/components/layout/app-topbar";
import { SessionProvider } from "@/components/session/session-provider";
import { getSessionUser } from "@/server/auth";

// Every page in (app) requires a session; API routes check it again on their own.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <SessionProvider user={user}>
      <div className="flex min-h-screen">
        <AppSidebar className="hidden lg:flex" />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar />
          <main className="flex-1 px-4 py-6 sm:px-6">
            <Breadcrumbs />
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
