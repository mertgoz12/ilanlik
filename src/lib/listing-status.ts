export type ListingStatus = "active" | "pending_review" | "pasif" | "silindi";

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  active: "Aktif",
  pending_review: "İncelemede",
  pasif: "Pasif",
  silindi: "Silindi",
};

export const LISTING_STATUS_STYLES: Record<ListingStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending_review: "border-amber-200 bg-amber-50 text-amber-700",
  pasif: "border-slate-200 bg-slate-100 text-slate-600",
  silindi: "border-red-200 bg-red-50 text-red-600",
};
