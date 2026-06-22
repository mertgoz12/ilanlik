import Link from "next/link";
import { LifeBuoy, Mail, ShieldCheck, Sparkles } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="bg-brand text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 text-xs sm:px-6 lg:px-8">
        <p className="flex min-w-0 items-center gap-1.5 truncate font-medium">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent" />
          <span className="truncate">
            <span className="font-semibold text-accent">ilanlio&apos;da</span> her ilan yapay
            zeka ile denetlenir — güvenle alın, şeffafça satın.
          </span>
        </p>
        <nav className="hidden shrink-0 items-center gap-4 sm:flex">
          <Link
            href="/nasil-calisir"
            className="flex items-center gap-1.5 text-white/75 transition-colors hover:text-white"
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            Yardım
          </Link>
          <Link
            href="/iletisim"
            className="flex items-center gap-1.5 text-white/75 transition-colors hover:text-white"
          >
            <Mail className="h-3.5 w-3.5" />
            Bize Ulaşın
          </Link>
          <Link
            href="/guvenli-alisveris"
            className="flex items-center gap-1.5 text-white/75 transition-colors hover:text-white"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Güvenli Alışveriş
          </Link>
        </nav>
      </div>
    </div>
  );
}
