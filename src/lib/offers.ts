// İkinci el ilan pazarlığı (Teklif Ver) için paylaşılan tipler, durum etiketleri
// ve doğrulama. Sunucu eylemleri ve istemci baloncukları bu modülü kullanır.

export type OfferStatus = "pending" | "accepted" | "rejected" | "countered";
export type OfferRole = "buyer" | "seller";

// İstemciye serileştirilebilir teklif görünümü (mesaj baloncuğu bununla çizilir).
export type OfferView = {
  id: string;
  amount: number;
  status: OfferStatus;
  role: OfferRole;
  createdById: string;
  note: string | null;
};

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  pending: "Bekliyor",
  accepted: "Kabul edildi",
  rejected: "Reddedildi",
  countered: "Karşı teklif verildi",
};

// Teklif tutarının makul sınırlar içinde olduğunu doğrular. İlan fiyatının 3
// katından fazla teklif "absürt" sayılıp engellenir (yazım hatası / kötüye
// kullanım koruması). Geçerliyse null döner.
export function validateOfferAmount(amount: number, listingPrice: number): string | null {
  if (!Number.isFinite(amount) || amount <= 0) {
    return "Geçerli bir teklif tutarı girin.";
  }
  if (amount > 1_000_000_000) {
    return "Teklif tutarı çok yüksek.";
  }
  if (listingPrice > 0 && amount > listingPrice * 3) {
    return "Teklif, ilan fiyatının çok üzerinde. Lütfen makul bir tutar girin.";
  }
  return null;
}
