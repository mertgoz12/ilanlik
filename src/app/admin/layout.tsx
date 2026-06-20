import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin-auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ToastProvider } from "@/components/admin/toast";

export const metadata: Metadata = {
  title: "Yönetim Paneli | İlanlio",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();

  return (
    <ToastProvider>
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8 lg:py-8">
        <AdminNav adminName={admin.name} />
        <div className="min-w-0 flex-1 space-y-6">
          <AdminTopbar adminName={admin.name} />
          {children}
        </div>
      </div>
    </ToastProvider>
  );
}
