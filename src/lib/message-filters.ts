// Mesajlaşmada iletişimin platform içinde kalmasını sağlamak için telefon
// numarası ve dış bağlantı paylaşımını tespit eder, ayrıca kısa sürede çok
// mesaj göndermeye karşı (spam) oran sınırlaması ayarlarını tanımlar.

const URL_PATTERN =
  /(https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(com|net|org|tr|io|app|info|xyz)(\.[a-z]{2})?\b/i;

const PHONE_PATTERN = /(\+?\d[\d\s().-]{8,}\d)/;

export function containsContactInfo(text: string): boolean {
  if (URL_PATTERN.test(text)) return true;

  const phoneMatch = text.match(PHONE_PATTERN);
  if (phoneMatch) {
    const digits = phoneMatch[0].replace(/\D/g, "");
    if (digits.length >= 10) return true;
  }

  return false;
}

export const CONTACT_INFO_WARNING =
  "Mesajlarda telefon numarası veya dış bağlantı paylaşımı yasaktır. Lütfen iletişimi platform üzerinden sürdürün.";

export const MAX_MESSAGE_LENGTH = 2000;

// Spam koruması: bu süre içinde en fazla bu kadar mesaj gönderilebilir.
export const MESSAGE_RATE_LIMIT = {
  windowMs: 60_000,
  maxMessages: 5,
};

export const RATE_LIMIT_WARNING =
  "Çok hızlı mesaj gönderiyorsunuz. Lütfen biraz bekleyip tekrar deneyin.";
