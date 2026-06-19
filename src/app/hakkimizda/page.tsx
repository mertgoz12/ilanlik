import type { Metadata } from "next";
import Link from "next/link";
import { SparkleIcon, ShieldCheckIcon, ScaleIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Hakkımızda - İlanlık" };

const HIGHLIGHTS = [
  {
    icon: SparkleIcon,
    title: "Yapay Zeka Ekspertiz",
    description:
      "Yayınlanan her ilan, fotoğraflar ve açıklamasıyla birlikte yapay zeka tarafından otomatik olarak incelenir.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Güven Puanı",
    description:
      "Her ilan; hasar geçmişi, tutarlılık analizi ve fiyat denetiminden geçirilerek hesaplanan bir güven puanıyla gösterilir.",
  },
  {
    icon: ScaleIcon,
    title: "Fiyat Denetimi",
    description:
      "Piyasa değerinin çok üzerindeki fahiş fiyatlar tespit edilir ve alıcıya vitrin olarak sunulmadan işaretlenir.",
  },
];

export default function HakkimizdaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand">
          Ana Sayfa
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-700">Hakkımızda</span>
      </nav>

      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Hakkımızda</h1>

      <div className="mt-6 space-y-5 text-sm leading-relaxed text-slate-600 sm:text-base">
        <p>
          <strong className="font-semibold text-foreground">İlanlık, Türkiye&apos;nin yapay zeka destekli
          güvenilir ilan platformudur.</strong> Sitemizde yayınlanan her ilan, yapay zeka tarafından otomatik
          olarak denetlenir; bu sayede fahiş fiyatlı ve tutarsız ilanlar alıcıya ulaşmadan tespit edilir. Amacımız,
          alıcı ile satıcıyı şeffaf ve güvenli bir ortamda buluşturmaktır.
        </p>
        <p>
          Misyonumuz, araç almak ya da satmak isteyen herkesin saniyeler içinde ilan verebildiği, alıcıların ise
          gönül rahatlığıyla inceleme yapıp karar verebildiği bir platform kurmaktır. Bunu yaparken sahte ilan, fahiş
          fiyat ve eksik bilgi gibi ilan platformlarında sıkça karşılaşılan sorunları yapay zeka teknolojisiyle en
          aza indirmeyi hedefliyoruz.
        </p>
        <p>
          Bizi diğer ilan platformlarından ayıran en önemli fark, denetimin insan onayına değil yapay zekaya
          dayanmasıdır: her ilan otomatik ekspertiz analizinden geçer, bir güven puanı alır ve piyasa değerine göre
          fiyat tutarlılığı kontrol edilir. Böylece alıcılar zaman kaybetmeden güvenilir ilanlara odaklanabilir,
          satıcılar ise emek verdikleri ilanlarının hak ettiği ilgiyi görmesinden emin olabilir.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-lg bg-white p-5 shadow-soft">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-light text-brand">
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-3 text-sm font-semibold text-foreground">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/ilan-ver"
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Ücretsiz İlan Ver
        </Link>
        <Link
          href="/nasil-calisir"
          className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:bg-accent-light"
        >
          Nasıl Çalışır?
        </Link>
      </div>
    </div>
  );
}
