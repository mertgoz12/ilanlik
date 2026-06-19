import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Çerez Politikası - İlanlık" };

const SECTIONS = [
  { id: "cerez-nedir", title: "Çerez Nedir?" },
  { id: "cerez-turleri", title: "Kullanılan Çerez Türleri" },
  { id: "kullanim-amaclari", title: "Çerezlerin Kullanım Amaçları" },
  { id: "yonetim", title: "Çerezlerin Yönetimi ve Reddedilmesi" },
  { id: "ucuncu-taraf", title: "Üçüncü Taraf Çerezleri" },
  { id: "degisiklikler", title: "Politika Değişiklikleri" },
];

export default function CerezPolitikasiPage() {
  return (
    <LegalPage title="Çerez Politikası" updatedAt="17 Haziran 2026" sections={SECTIONS}>
      <h2 id="cerez-nedir">1. Çerez Nedir?</h2>
      <p>
        Çerezler (cookies), bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza kaydedilen
        küçük metin dosyalarıdır. Çerezler; sitenin düzgün çalışmasını sağlamak, tercihlerinizi hatırlamak ve
        Platform&apos;u nasıl kullandığınızı anlayarak deneyiminizi iyileştirmek amacıyla kullanılır. İlanlık,
        Platform&apos;u ziyaret ettiğinizde ilk girişte gösterilen çerez bildirimi üzerinden tercihlerinizi
        belirlemenize imkân tanır.
      </p>

      <h2 id="cerez-turleri">2. Kullanılan Çerez Türleri</h2>
      <ul>
        <li>
          <strong>Zorunlu Çerezler:</strong> Oturum açma, güvenlik, form gönderimi ve temel site işlevlerinin
          çalışması için gereklidir. Bu çerezler devre dışı bırakılamaz; reddedilmesi Platform&apos;un düzgün
          çalışmamasına yol açar.
        </li>
        <li>
          <strong>Performans / Analitik Çerezler:</strong> Hangi sayfaların ziyaret edildiği, sitede geçirilen süre
          gibi kullanım istatistiklerinin anonim/toplulaştırılmış şekilde analiz edilerek Platform&apos;un
          performansının ölçülmesini sağlar.
        </li>
        <li>
          <strong>Fonksiyonel Çerezler:</strong> Dil seçimi, son görüntülenen kategori veya arama filtreleri gibi
          tercihlerinizin hatırlanmasını sağlar.
        </li>
        <li>
          <strong>Pazarlama Çerezleri:</strong> İlgi alanlarınıza uygun içerik ve kampanya gösterimi amacıyla
          kullanılabilir; bu çerezler yalnızca açık onayınızla etkinleştirilir.
        </li>
      </ul>

      <h2 id="kullanim-amaclari">3. Çerezlerin Kullanım Amaçları</h2>
      <ul>
        <li>Oturumunuzu açık tutmak ve hesabınızın güvenliğini sağlamak,</li>
        <li>Arama ve filtre tercihlerinizi hatırlamak,</li>
        <li>Site trafiğini ve kullanım eğilimlerini analiz ederek Platform&apos;u geliştirmek,</li>
        <li>Çerez tercihlerinizin (kabul/red) kendisini hatırlamak,</li>
        <li>İzin verdiğiniz ölçüde, size daha ilgili içerik ve kampanyalar sunmak.</li>
      </ul>

      <h2 id="yonetim">4. Çerezlerin Yönetimi ve Reddedilmesi</h2>
      <p>
        Platform&apos;u ilk ziyaretinizde ekranın altında bir çerez bildirimi gösterilir; buradan
        &quot;Kabul Et&quot; diyerek tüm çerez kategorilerini onaylayabilir veya &quot;Ayarları Yönet&quot;
        seçeneğiyle zorunlu olmayan kategorileri (performans, fonksiyonel, pazarlama) ayrı ayrı açıp
        kapatabilirsiniz. Tercihlerinizi dilediğiniz zaman bu sayfanın altındaki çerez ayarlarına dönerek veya
        tarayıcınızın ayarlar menüsünden değiştirebilirsiniz.
      </p>
      <p>
        Ayrıca, kullandığınız tarayıcının ayarlar bölümünden çerezleri tamamen engelleyebilir veya mevcut çerezleri
        silebilirsiniz. Tarayıcı ayarlarından çerezleri engellemeniz hâlinde Platform&apos;un bazı bölümleri
        beklendiği gibi çalışmayabilir.
      </p>

      <h2 id="ucuncu-taraf">5. Üçüncü Taraf Çerezleri</h2>
      <p>
        Platform&apos;da, performans ölçümü veya içerik gösterimi amacıyla üçüncü taraf hizmet sağlayıcılara ait
        çerezler de kullanılabilir. Bu çerezler, ilgili üçüncü tarafın kendi gizlilik ve çerez politikalarına
        tabidir; söz konusu çerezler yalnızca onay verdiğiniz kategoriler etkinleştirildiğinde çalışır.
      </p>

      <h2 id="degisiklikler">6. Politika Değişiklikleri</h2>
      <p>
        İlanlık, bu Çerez Politikası&apos;nı mevzuat değişiklikleri veya kullanılan çerez türlerindeki güncellemeler
        doğrultusunda değiştirme hakkını saklı tutar. Güncel politika her zaman bu sayfada yayınlanır.
      </p>
    </LegalPage>
  );
}
