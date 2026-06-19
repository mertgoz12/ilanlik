import Link from "next/link";

export function AdminPagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefForPage(target: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") params.set(key, value);
    }
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <nav className="mt-4 flex items-center justify-center gap-1.5">
      <Link
        href={hrefForPage(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium transition-colors ${
          page === 1 ? "pointer-events-none text-slate-300" : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        Önceki
      </Link>

      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-slate-300">…</span>}
          <Link
            href={hrefForPage(p)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              p === page ? "bg-[#0F172A] text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {p}
          </Link>
        </span>
      ))}

      <Link
        href={hrefForPage(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium transition-colors ${
          page === totalPages ? "pointer-events-none text-slate-300" : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        Sonraki
      </Link>
    </nav>
  );
}
