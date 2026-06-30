import Link from "next/link";
import { CheckCircleIcon, ClockIcon, PlusIcon } from "@/components/icons";

// İlan onaya gönderildikten sonra gösterilen başarı ekranı. İlan henüz yayında
// olmadığından (status=pending_review) detay sayfasına değil, kullanıcının
// "İlan Yönetimi" paneline yönlendirilir.
export function SubmittedScreen() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-soft">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
        <CheckCircleIcon className="h-9 w-9" />
      </span>
      <h2 className="mt-5 text-xl font-bold text-foreground">İlanınız incelemeye gönderildi</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        İlanınız ekibimiz tarafından incelenecek. Onaylandıktan sonra otomatik olarak yayına
        alınacak ve size bildirim göndereceğiz. Bu işlem genellikle kısa sürer.
      </p>

      <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2 text-sm font-semibold text-amber-700">
        <ClockIcon className="h-4 w-4" />
        Durum: İnceleniyor
      </div>

      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/hesabim/ilanlarim"
          className="inline-flex w-full items-center justify-center rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-700 sm:w-auto"
        >
          İlanlarıma Git
        </Link>
        {/* Düz <a>: aynı route'a (/ilan-ver) tam sayfa yenilemesiyle gidip
            formun tüm istemci state'ini (submitted durumu, seçili kategori,
            doldurulmuş alanlar) sıfırlar; böylece kullanıcı boş bir formla
            yeni ilan girebilir. Next.js <Link> yumuşak geçiş yaptığından
            state korunur ve form tekrar doldurulamazdı. */}
        <a
          href="/ilan-ver"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
        >
          <PlusIcon className="h-4 w-4" />
          Yeni İlan Ver
        </a>
      </div>
    </div>
  );
}
