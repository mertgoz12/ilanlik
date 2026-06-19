"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

// "use server" dosyasındaki TÜM fonksiyonlar HTTP üzerinden çağrılabilir
// server action'lardır; arayüz admin olmayanlara göstermese de requireAdmin()
// burada (ikinci savunma katmanı olarak) yeniden doğrulama yapar.
//
// Sadece isDemo=true işaretli kullanıcı/ilanları ve bunlara bağlı tüm ilişkili
// kayıtları (görsel, mesaj, favori, opsiyon vb. - hepsi onDelete: Cascade ile
// tanımlı) KALICI olarak siler. Gerçek (isDemo=false) veriye dokunmaz.
export async function clearDemoDataAction() {
  await requireAdmin();

  await prisma.listing.deleteMany({ where: { isDemo: true } });
  await prisma.user.deleteMany({ where: { isDemo: true } });

  revalidatePath("/admin/demo-verileri");
  revalidatePath("/admin/ilanlar");
  revalidatePath("/admin/kullanicilar");
  revalidatePath("/admin/moderasyon");
  revalidatePath("/admin");
  revalidatePath("/");
}
