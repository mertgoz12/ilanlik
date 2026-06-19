import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Mesafeli Satış Sözleşmesi - İlanlık" };

const SECTIONS = [
  { id: "taraflar", title: "Taraflar" },
  { id: "konu", title: "Sözleşmenin Konusu" },
  { id: "hizmet-ozellikleri", title: "Hizmetin Temel Özellikleri ve Bedeli" },
  { id: "odeme-sekli", title: "Ödeme Şekli" },
  { id: "ifa", title: "Hizmetin İfası" },
  { id: "cayma-hakki", title: "Cayma Hakkı" },
  { id: "cayma-istisnalari", title: "Cayma Hakkının Kullanılamayacağı Durumlar" },
  { id: "iade-sureci", title: "İade Süreci" },
  { id: "genel-hukumler", title: "Genel Hükümler" },
  { id: "yetkili-mahkeme", title: "Yetkili Mahkeme" },
];

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <LegalPage title="Mesafeli Satış Sözleşmesi" updatedAt="17 Haziran 2026" sections={SECTIONS}>
      <p>
        Bu Mesafeli Satış Sözleşmesi (&quot;Sözleşme&quot;), İlanlık Platformu üzerinden sunulan ve bedel karşılığı
        satın alınabilen dijital hizmetler (örn. ilan vitrine/öne çıkarma, galeri ve kurumsal üyelik paketleri vb.)
        için geçerli genel çerçeveyi düzenler. Bu hizmetlerden birini satın aldığınızda, sipariş onayı sırasında bu
        Sözleşme&apos;yi kabul etmiş sayılırsınız. Bu Sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve
        Mesafeli Sözleşmeler Yönetmeliği hükümlerine uygun olarak hazırlanmıştır.
      </p>

      <h2 id="taraflar">1. Taraflar</h2>
      <p>
        <strong>Hizmet Sağlayıcı:</strong> İlanlık (ilanlik.com) (&quot;İlanlık&quot;, &quot;Satıcı/Sağlayıcı&quot;).
        İletişim: <strong>destek@ilanlik.com</strong>.
      </p>
      <p>
        <strong>Alıcı:</strong> İlanlık Platformu üzerinden ücretli bir hizmeti satın alan, üyelik hesabı bulunan
        gerçek veya tüzel kişi (&quot;Alıcı&quot;, &quot;Tüketici&quot;).
      </p>

      <h2 id="konu">2. Sözleşmenin Konusu</h2>
      <p>
        Bu Sözleşme&apos;nin konusu, Alıcı&apos;nın İlanlık Platformu üzerinden elektronik ortamda sipariş verdiği
        dijital hizmetin (örn. ilanın vitrine taşınması/öne çıkarılması, galeri/kurumsal üyelik paketi gibi katma
        değerli hizmetler) özellikleri, satış fiyatı, ödeme şekli, ifa koşulları ile Alıcı&apos;nın 6502 sayılı
        Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca sahip olduğu hakların belirlenmesidir.
      </p>

      <h2 id="hizmet-ozellikleri">3. Hizmetin Temel Özellikleri ve Bedeli</h2>
      <p>
        Satın alınacak hizmetin türü, kapsamı, süresi ve bedeli (KDV dâhil satış fiyatı), Alıcı&apos;nın siparişi
        onayladığı satın alma ekranında açıkça gösterilir ve bu bilgiler işbu Sözleşme&apos;nin ayrılmaz bir
        parçasını oluşturur. İlanlık, hizmet kapsamı ve fiyatlandırmayı önceden ilan ederek güncelleme hakkını
        saklı tutar; güncelleme, daha önce tamamlanmış siparişleri etkilemez.
      </p>

      <h2 id="odeme-sekli">4. Ödeme Şekli</h2>
      <p>
        Ödeme, sipariş sırasında Platform&apos;da sunulan ödeme yöntemleri (banka/kredi kartı veya İlanlık&apos;ın
        anlaşmalı olduğu ödeme hizmet sağlayıcıları aracılığıyla) kullanılarak gerçekleştirilir. Ödeme bilgileri,
        İlanlık sunucularında saklanmaz; işlem, ilgili ödeme kuruluşunun güvenli altyapısı üzerinden tamamlanır.
        Sipariş, ödemenin başarıyla onaylanmasıyla kesinleşir.
      </p>

      <h2 id="ifa">5. Hizmetin İfası</h2>
      <p>
        Dijital nitelikteki hizmetler (vitrine taşıma, öne çıkarma, üyelik paketi etkinleştirme vb.), ödemenin
        onaylanmasının ardından genellikle anında veya en geç makul bir süre içinde Alıcı&apos;nın hesabına
        tanımlanarak ifa edilir. Hizmetin ifa edilemediği durumlarda Alıcı bilgilendirilir ve ödenen bedel iade
        edilir.
      </p>

      <h2 id="cayma-hakki">6. Cayma Hakkı</h2>
      <p>
        Alıcı, hizmetin ifasına başlanmamış olması kaydıyla, sözleşmenin kurulduğu tarihten itibaren{" "}
        <strong>14 (on dört) gün</strong> içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin
        sözleşmeden cayma hakkına sahiptir. Cayma hakkını kullanmak isteyen Alıcı, bu süre içinde{" "}
        <strong>destek@ilanlik.com</strong> adresine yazılı bildirimde bulunmalıdır.
      </p>

      <h2 id="cayma-istisnalari">7. Cayma Hakkının Kullanılamayacağı Durumlar</h2>
      <p>
        Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesi uyarınca, aşağıdaki durumlarda cayma hakkı
        kullanılamaz:
      </p>
      <ul>
        <li>Alıcı&apos;nın onayı ile cayma hakkı süresi dolmadan ifasına başlanan hizmetler (örn. ilanın talep
        üzerine hemen vitrine taşınması/öne çıkarılması),</li>
        <li>Fiyatı finansal piyasalardaki dalgalanmalara bağlı olarak değişen mal/hizmetler,</li>
        <li>Elektronik ortamda anında ifa edilen ve gayri maddi mal niteliğindeki hizmetler ile tüketiciye anında
        teslim edilen dijital içerikler.</li>
      </ul>
      <p>
        İlanlık, anında ifa edilen dijital hizmetler için sipariş onayı ekranında Alıcı&apos;dan, hizmetin hemen
        ifasına başlanmasını onayladığına ve bu hâlde cayma hakkını kaybettiğine ilişkin açık onay talep eder.
      </p>

      <h2 id="iade-sureci">8. İade Süreci</h2>
      <p>
        Cayma hakkının süresi içinde ve usulüne uygun şekilde kullanılması hâlinde, hizmetin ifasına henüz
        başlanmamışsa, Alıcı&apos;dan tahsil edilen bedel, cayma bildiriminin İlanlık&apos;a ulaşmasından itibaren{" "}
        <strong>14 (on dört) gün</strong> içinde, ödemenin yapıldığı yöntemle iade edilir. Hizmetin kısmen ifa
        edilmiş olduğu hâllerde, ifa edilen kısma karşılık gelen bedel iade dışında tutulabilir.
      </p>

      <h2 id="genel-hukumler">9. Genel Hükümler</h2>
      <ul>
        <li>Alıcı, sipariş onayı sırasında verdiği bilgilerin doğru ve güncel olduğunu kabul eder.</li>
        <li>İlanlık, mücbir sebep hâllerinde (doğal afet, ağır arıza, mevzuat değişikliği vb.) hizmetin ifasını
        makul bir süre erteleyebilir; bu durum Alıcı&apos;ya bildirilir.</li>
        <li>Bu Sözleşme kapsamındaki kişisel veri işleme faaliyetleri{" "}
        <a href="/gizlilik-politikasi" className="font-medium text-brand underline hover:text-accent-dark">
          Gizlilik Politikası
        </a>{" "}
        ve{" "}
        <a href="/kvkk" className="font-medium text-brand underline hover:text-accent-dark">
          KVKK Aydınlatma Metni
        </a>
        &apos;ne tabidir.</li>
        <li>Alıcı, şikâyet ve itirazlarını Tüketici Hakem Heyetlerine veya Tüketici Mahkemelerine
        iletebilir.</li>
      </ul>

      <h2 id="yetkili-mahkeme">10. Yetkili Mahkeme</h2>
      <p>
        İşbu Sözleşme&apos;den kaynaklanan uyuşmazlıklarda, Ticaret Bakanlığı&apos;nca her yıl ilan edilen parasal
        sınırlar dâhilinde Alıcı&apos;nın veya İlanlık&apos;ın yerleşim yerindeki Tüketici Hakem Heyetleri ile
        Tüketici Mahkemeleri yetkilidir.
      </p>
    </LegalPage>
  );
}
