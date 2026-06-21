import { Award, Ban, ScanSearch, ShieldAlert } from "lucide-react";

const ITEMS = [
  {
    icon: ScanSearch,
    title: "Yapay Zeka Ekspertiz",
    text: "Her ilan, fotoğraf ve açıklamasıyla birlikte yapay zeka tarafından otomatik olarak incelenir.",
  },
  {
    icon: Ban,
    title: "Fahiş Fiyat Engeli",
    text: "Piyasa değerinin çok üzerindeki fiyatlar tespit edilir ve vitrine çıkmadan işaretlenir.",
  },
  {
    icon: ShieldAlert,
    title: "Tutarsız İlan Tespiti",
    text: "Açıklama, hasar bilgisi ve fotoğraflar arasındaki tutarsızlıklar otomatik olarak tespit edilir.",
  },
  {
    icon: Award,
    title: "Güven Puanı",
    text: "Her ilan; hasar geçmişi ve tutarlılık analizine göre hesaplanan bir güven puanıyla gösterilir.",
  },
];

export function TrustStrip() {
  return (
    <section className="border-b border-slate-200/70 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            Neden İlanlio?
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Yapay zeka destekli denetim ile güvenle alın, şeffafça satın.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-soft transition-shadow duration-200 hover:shadow-soft-lg sm:p-4"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-accent">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold text-foreground">{title}</h3>
              <p className="text-xs leading-relaxed text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
