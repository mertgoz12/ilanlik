// Opsiyonlama ile ilgili saf metin biçimleme fonksiyonları - bilerek
// src/lib/listing-options.ts'den AYRI tutulur: o dosya Prisma'ya bağımlıdır
// ve client component'lerden import edilemez. Bu dosya bağımlılıksızdır,
// hem sunucu hem istemci tarafında güvenle kullanılabilir.

export function formatOptionDuration(hours: number): string {
  if (hours >= 48 && hours % 24 === 0) {
    return `${hours / 24} gün`;
  }
  return `${hours} saat`;
}

export function formatRemainingTime(endsAt: Date, now: Date = new Date()): string {
  const diffMs = endsAt.getTime() - now.getTime();
  if (diffMs <= 0) return "Süresi doldu";

  const totalMinutes = Math.ceil(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return remHours > 0 ? `${days} gün ${remHours} saat kaldı` : `${days} gün kaldı`;
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours} saat ${minutes} dakika kaldı` : `${hours} saat kaldı`;
  }
  return `${minutes} dakika kaldı`;
}
