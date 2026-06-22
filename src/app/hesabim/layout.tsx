import type { Metadata } from "next";
import { requireUserPage } from "@/lib/account-auth";
import { AccountNav } from "@/components/account/account-nav";
import { ToastProvider } from "@/components/admin/toast";

export const metadata: Metadata = {
  title: "Hesabım | İlanlio",
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUserPage();

  return (
    <ToastProvider>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8 lg:py-8">
        <AccountNav userName={user.name} avatarUrl={user.avatarUrl} />
        <div className="min-w-0 flex-1 space-y-6">{children}</div>
      </div>
    </ToastProvider>
  );
}
