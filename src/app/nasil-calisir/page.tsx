import type { Metadata } from "next";
import Link from "next/link";
import {
  UserIcon,
  PlusIcon,
  SparkleIcon,
  CheckCircleIcon,
  SearchIcon,
  ShieldCheckIcon,
  GaugeIcon,
  MessageIcon,
} from "@/components/icons";

export const metadata: Metadata = { title: "Nasıl Çalışır - İlanlık" };

const SELLER_STEPS = [
  { icon: UserIcon, title: "Üye Ol", description: "Saniyeler içinde ücretsiz bir hesap oluşturun." },
  { icon: PlusIcon, title: "İlan Ver", description: "Aracınızın bilgilerini ve fotoğraflarını ekleyin." },
  {
    icon: SparkleIcon,
    title: "Yapay Zeka Analizi",
    description: "İlanınız otomatik olarak denetlenir; fiyat ve tutarlılık kontrolünden geçer.",
  },
  { icon: CheckCircleIcon, title: "Yayınla", description: "Onaylanan ilanınız binlerce alıcıya görünür olur." },
];

const BUYER_STEPS = [
  { icon: SearchIcon, title: "Ara", description: "Aradığınız aracı marka, model veya bütçeye göre filtreleyin." },
  {
    icon: ShieldCheckIcon,
    title: "Güven Puanına Bakın",
    description: "Her ilanın yanında yapay zeka tarafından hesaplanan güven puanını görün.",
  },
  {
    icon: GaugeIcon,
    title: "Ekspertiz Raporunu İnceleyin",
    description: "Detaylı yapay zeka ekspertiz raporuyla aracın gerçek durumunu öğrenin.",
  },
  {
    icon: MessageIcon,
    title: "Satıcıyla Mesajlaşın",
    description: "Güvendiğiniz ilan için doğrudan satıcıyla iletişime geçin.",
  },
];

function StepGrid({ steps }: { steps: typeof SELLER_STEPS }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map(({ icon: Icon, title, description }, i) => (
        <div key={title} className="relative rounded-lg bg-white p-5 shadow-soft">
          <span className="absolute -top-3 -left-3 flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-accent">
            {i + 1}
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-light text-brand">
            <Icon className="h-5 w-5" />
          </span>
          <h3 className="mt-3 text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
        </div>
      ))}
    </div>
  );
}

export default function NasilCalisirPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand">
          Ana Sayfa
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-700">Nasıl Çalışır</span>
      </nav>

      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Nasıl Çalışır?</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">
        İlanlık&apos;ta hem ilan vermek hem de güvenle alışveriş yapmak çok basit. Adımlar şöyle:
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">Satıcılar İçin</h2>
        <div className="mt-4">
          <StepGrid steps={SELLER_STEPS} />
        </div>
        <Link
          href="/ilan-ver"
          className="mt-6 inline-flex items-center rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Şimdi İlan Ver
        </Link>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-foreground">Alıcılar İçin</h2>
        <div className="mt-4">
          <StepGrid steps={BUYER_STEPS} />
        </div>
        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:bg-accent-light"
        >
          İlanları Keşfet
        </Link>
      </section>
    </div>
  );
}
