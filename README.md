# İlanlio

İlanlio (ilanlio.com), her ilanın yapay zeka destekli bir denetimden geçtiği,
ikinci el ve sıfır ürün/araç ilan platformu. [Next.js](https://nextjs.org)
App Router üzerinde, Prisma + PostgreSQL (Neon) ile yazıldı.

## Geliştirme

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresini açarak sonucu görebilirsiniz.

`.env` dosyasına en azından şu değişkenler gerekir: `DATABASE_URL`,
`AUTH_SECRET`, `ANTHROPIC_API_KEY`.

## Veritabanı

```bash
npx prisma generate       # Prisma client'ı üret
npx prisma db push        # şemayı veritabanına uygula
npm run db:seed-categories # kategori taksonomisi
npm run db:seed-vehicles   # el ile düzenlenmiş araç kataloğu
npm run db:create-admin    # admin hesabı oluştur
```

## Dağıtım (Deploy)

Proje [Vercel](https://vercel.com) üzerinde, [Neon](https://neon.tech)
PostgreSQL veritabanına bağlı olarak çalışır. `npm run build` komutu
`prisma generate`'i otomatik çalıştırır.
