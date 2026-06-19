import { Sparkles } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="bg-brand text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2 text-center text-xs font-medium sm:px-6 sm:text-sm lg:px-8">
        <Sparkles className="h-4 w-4 shrink-0 text-accent" />
        <p className="truncate">
          <span className="font-semibold text-accent">İlanlık&apos;ta</span> her ilan yapay
          zeka ile denetlenir — güvenle alın, şeffafça satın.
        </p>
      </div>
    </div>
  );
}
