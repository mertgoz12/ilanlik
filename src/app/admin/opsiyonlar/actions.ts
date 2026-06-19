"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { adminEndOption, getOptionSettings } from "@/lib/listing-options";

function clampInt(value: number, min: number, max: number): number {
  return Math.min(Math.max(Math.round(value), min), max);
}

function readNumber(formData: FormData, key: string, fallback: number): number {
  const raw = formData.get(key);
  if (raw == null) return fallback;
  const num = Number(raw);
  return Number.isFinite(num) ? num : fallback;
}

// "use server" dosyasındaki TÜM fonksiyonlar HTTP üzerinden çağrılabilir
// server action'lardır; arayüz admin olmayanlara göstermese de requireAdmin()
// burada (ikinci savunma katmanı olarak) yeniden doğrulama yapar.
export async function updateOptionSettingsAction(formData: FormData) {
  await requireAdmin();

  const current = await getOptionSettings();

  const durationsRaw = String(formData.get("optionDurationsHours") ?? "");
  const parsedDurations = durationsRaw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  const durationsHours = parsedDurations.length > 0 ? parsedDurations : current.durationsHours;

  const maxActivePerUser = clampInt(
    readNumber(formData, "optionMaxActivePerUser", current.maxActivePerUser),
    1,
    100,
  );
  const maxWeeklyCancellations = clampInt(
    readNumber(formData, "optionMaxWeeklyCancellations", current.maxWeeklyCancellations),
    1,
    100,
  );

  await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: {
      optionDurationsHours: JSON.stringify(durationsHours),
      optionMaxActivePerUser: maxActivePerUser,
      optionMaxWeeklyCancellations: maxWeeklyCancellations,
    },
    create: {
      id: "singleton",
      optionDurationsHours: JSON.stringify(durationsHours),
      optionMaxActivePerUser: maxActivePerUser,
      optionMaxWeeklyCancellations: maxWeeklyCancellations,
    },
  });

  revalidatePath("/admin/opsiyonlar");
}

export async function adminEndOptionAction(listingId: string) {
  await requireAdmin();

  const result = await adminEndOption(listingId);
  if (!result.ok) {
    throw new Error(result.error);
  }

  revalidatePath("/admin/opsiyonlar");
  revalidatePath("/admin/ilanlar");
}
