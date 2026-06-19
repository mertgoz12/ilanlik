export function formatPrice(price: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatKm(km: number): string {
  return `${new Intl.NumberFormat("tr-TR").format(km)} km`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

// Sadece saat:dakika (örn. "14:32") - mesaj balonlarında tam saat göstermek için.
export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}

// Tam tarih + saat (örn. "13 Haziran 14:32") - tooltip içeriği için.
export function formatFullDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string, now: Date | number = Date.now()): string {
  const target = new Date(date);
  const reference = new Date(now);
  const diffSec = Math.floor((reference.getTime() - target.getTime()) / 1000);

  if (diffSec < 60) return "az önce";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} dk önce`;

  const startOfToday = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const dayDiff = Math.round((startOfToday.getTime() - startOfTarget.getTime()) / 86_400_000);

  if (dayDiff <= 0) {
    const diffHour = Math.floor(diffMin / 60);
    return `${diffHour} saat önce`;
  }
  if (dayDiff === 1) return "dün";

  if (target.getFullYear() === reference.getFullYear()) {
    return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long" }).format(target);
  }
  return formatDate(target);
}
