import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Kullanım Koşulları - İlanlık" };

const SECTIONS = [
  { id: "taraflar-ve-kabul", title: "Taraflar ve Kabul" },
  { id: "tanimlar", title: "Tanımlar" },
  { id: "uyelik-sartlari", title: "Üyelik Şartları" },
  { id: "ilan-verme-kurallari", title: "İlan Verme Kuralları" },
  { id: "yasakli-icerikler", title: "Yasaklı İçerikler ve Faaliyetler" },
  { id: "fiyat-denetimi", title: "Fiyat Denetimi ve Yapay Zeka İncelemesi Politikası" },
  { id: "platform-disina-cikmama", title: "Platform Dışına Çıkmama Yükümlülüğü" },
  { id: "icerikten-sorumluluk", title: "İçerikten Sorumluluk" },
  { id: "hesap-askiya-alma", title: "Hesabın Askıya Alınması ve Kapatılması" },
  { id: "fikri-mulkiyet", title: "Fikri Mülkiyet Hakları" },
  { id: "sorumlulugun-sinirlandirilmasi", title: "Sorumluluğun Sınırlandırılması" },
  { id: "degisiklik-hakki", title: "Değişiklik Hakkı" },
  { id: "uyusmazlik", title: "Uyuşmazlıkların Çözümü ve Yetkili Mahkeme" },
  { id: "iletisim", title: "İletişim" },
];

export default function KullanimKosullariPage() {
  return (
    <LegalPage title="Kullanım Koşulları" updatedAt="17 Haziran 2026" sections={SECTIONS}>
      <h2 id="taraflar-ve-kabul">1. Taraflar ve Kabul</h2>
      <p>
        Bu Kullanım Koşulları (&quot;Koşullar&quot;), ilanlik.com alan adı üzerinden hizmet veren İlanlık
        (&quot;İlanlık&quot;, &quot;Platform&quot;, &quot;biz&quot;) ile Platform&apos;u ziyaret eden, üye olan veya
        ilan veren/inceleyen her gerçek ve tüzel kişi (&quot;Kullanıcı&quot;, &quot;siz&quot;) arasındaki ilişkiyi
        düzenler. Platform&apos;a erişim sağlamanız, üye olmanız veya Platform&apos;u herhangi bir şekilde
        kullanmanız, bu Koşulları okuduğunuzu, anladığınızı ve kabul ettiğinizi gösterir. Bu Koşulları kabul
        etmiyorsanız Platform&apos;u kullanmamalısınız.
      </p>
      <p>
        İlanlık, üyelik ve ilan verme süreçlerinde kullanıcıların paylaştığı kişisel verileri{" "}
        <a href="/gizlilik-politikasi" className="font-medium text-brand underline hover:text-accent-dark">
          Gizlilik Politikası
        </a>{" "}
        ve{" "}
        <a href="/kvkk" className="font-medium text-brand underline hover:text-accent-dark">
          KVKK Aydınlatma Metni
        </a>
        &apos;nde açıklanan esaslara göre işler. Bu Koşullar, anılan metinlerle birlikte bir bütün olarak
        değerlendirilir.
      </p>

      <h2 id="tanimlar">2. Tanımlar</h2>
      <ul>
        <li><strong>Platform:</strong> ilanlik.com web sitesi ve buna bağlı tüm dijital servisler.</li>
        <li><strong>Kullanıcı:</strong> Platform&apos;a üye olan veya üye olmaksızın Platform&apos;u ziyaret eden kişi.</li>
        <li><strong>Satıcı:</strong> Platform üzerinde ilan yayınlayan Kullanıcı.</li>
        <li><strong>Alıcı:</strong> Platform üzerindeki ilanları inceleyen ve satıcı ile iletişime geçen Kullanıcı.</li>
        <li><strong>İlan:</strong> Satıcı tarafından Platform&apos;a yüklenen, satışa veya kiralamaya konu ürün/araç/hizmet hakkındaki bilgi, fotoğraf ve açıklamaların bütünü.</li>
        <li><strong>Güven Puanı:</strong> Bir ilanın yapay zeka tarafından hasar geçmişi, tutarlılık ve fiyat analizine göre değerlendirilmesiyle oluşturulan puan.</li>
      </ul>

      <h2 id="uyelik-sartlari">3. Üyelik Şartları</h2>
      <p>Platform&apos;a üye olabilmek için aşağıdaki şartlar geçerlidir:</p>
      <ul>
        <li>18 yaşını doldurmuş ve hukuki işlem yapma yetkisine sahip olmak.</li>
        <li>Üyelik formunda istenen ad-soyad, e-posta ve (varsa) telefon bilgilerini doğru ve güncel şekilde sağlamak.</li>
        <li>Hesap bilgilerinin (özellikle şifrenin) gizliliğini korumak; hesap üzerinden yapılan tüm işlemlerden sorumlu olmak.</li>
        <li>Bir kişinin yalnızca bir üyelik hesabı bulunabilir; sahte kimlik veya başkası adına üyelik oluşturulamaz.</li>
      </ul>
      <p>
        İlanlık, üyelik başvurusunu herhangi bir gerekçe göstermeksizin reddetme veya mevcut bir üyeliği bu
        Koşullar&apos;a aykırılık tespit edilmesi hâlinde sonlandırma hakkını saklı tutar.
      </p>

      <h2 id="ilan-verme-kurallari">4. İlan Verme Kuralları</h2>
      <p>İlan veren Satıcılar aşağıdaki kurallara uymayı kabul eder:</p>
      <ul>
        <li>İlana eklenen bilgi, fotoğraf ve açıklamalar gerçeği yansıtmalı; satışa konu ürünün/aracın güncel durumunu doğru şekilde tarif etmelidir.</li>
        <li>Bir ilan, yalnızca tek bir ürün/araç için verilebilir; aynı ürün için birden fazla mükerrer ilan yayınlanamaz.</li>
        <li>Fiyat bilgisi, satışın gerçekleşeceği gerçek bedeli yansıtmalı; alıcıyı yanıltacak şekilde düşük veya yapay olarak yüksek girilmemelidir.</li>
        <li>Araç ilanlarında hasar, boya ve değişen parça bilgileri eksiksiz ve doğru beyan edilmelidir.</li>
        <li>İlan, ilgili mevzuatta satışı/ilanı yasak veya kısıtlı olan ürün ya da hizmetleri içeremez.</li>
      </ul>
      <p>
        İlanlık, bu kurallara aykırı olduğunu tespit ettiği ilanları yayından kaldırma, düzenleme talep etme veya
        ilgili hesabı uyarma/askıya alma hakkına sahiptir.
      </p>

      <h2 id="yasakli-icerikler">5. Yasaklı İçerikler ve Faaliyetler</h2>
      <p>Platform üzerinde aşağıdaki içerik ve faaliyetler kesinlikle yasaktır:</p>
      <ul>
        <li>Yasalara, kamu düzenine veya genel ahlaka aykırı içerikler.</li>
        <li>Üçüncü kişilerin fikri mülkiyet haklarını, kişilik haklarını veya gizlilik haklarını ihlal eden içerikler.</li>
        <li>Çalıntı, kaçak veya sahte belgeli ürün/araçların ilanı.</li>
        <li>Yanıltıcı, gerçeği yansıtmayan veya sahte (örn. var olmayan bir ürünü tanıtan) ilanlar.</li>
        <li>Dolandırıcılık, kimlik avı (phishing) veya kullanıcıları Platform dışında ödeme yapmaya yönlendirme girişimleri.</li>
        <li>Spam, istenmeyen ticari ileti gönderimi veya Platform&apos;un mesajlaşma sistemini kötüye kullanma.</li>
        <li>Platform&apos;un teknik altyapısına zarar verecek, otomatik veri toplayan (bot, scraping) veya güvenliği tehdit edecek faaliyetler.</li>
        <li>Başka bir kullanıcının kimliğine bürünmek veya yanlış bilgiyle hesap oluşturmak.</li>
      </ul>
      <p>
        Bu maddeye aykırı davranış tespit edilmesi hâlinde İlanlık, ilgili içeriği kaldırma, hesabı askıya alma veya
        kapatma ve gerekli görmesi hâlinde yetkili makamlara bildirimde bulunma hakkını saklı tutar.
      </p>

      <h2 id="fiyat-denetimi">6. Fiyat Denetimi ve Yapay Zeka İncelemesi Politikası</h2>
      <p>
        İlanlık&apos;ın temel ayırt edici özelliği, yayınlanan her ilanın yapay zeka destekli bir denetimden
        geçirilmesidir. Bu denetim kapsamında:
      </p>
      <ul>
        <li>İlan fiyatı, benzer marka/model/yıl/kilometre özelliklerine sahip emsal ilanlarla karşılaştırılarak piyasa değerine göre değerlendirilir.</li>
        <li>Piyasa değerinin makul ölçüde üzerinde olduğu tespit edilen <strong>fahiş fiyatlı ilanlar</strong> işaretlenir ve vitrin/öne çıkan listelerde gösterilmeyebilir.</li>
        <li>İlan açıklaması, fotoğrafları ve beyan edilen teknik özellikler arasındaki <strong>tutarsızlıklar</strong> (örn. beyan edilen hasar durumuyla fotoğrafların uyuşmaması) otomatik olarak tespit edilmeye çalışılır.</li>
        <li>Bu analiz sonucunda her ilan için bir Güven Puanı hesaplanır ve ilan sayfasında alıcılara gösterilir.</li>
      </ul>
      <p>
        Yapay zeka analizleri, ilan içeriğindeki bilgilerden ve kamuya açık/emsal verilerden üretilen istatistiksel bir
        değerlendirmedir; bağlayıcı bir ekspertiz raporu, sigorta değerlemesi veya hukuki garanti niteliği taşımaz.
        İlanlık, analiz sonuçlarının nihai doğruluğunu garanti etmez; ancak tespit edilen aykırılıklar için ilanı
        düzenleme, geçici olarak yayından kaldırma veya ilan sahibinden ek bilgi talep etme hakkını saklı tutar.
      </p>

      <h2 id="platform-disina-cikmama">7. Platform Dışına Çıkmama Yükümlülüğü</h2>
      <p>
        Kullanıcıların güvenliğini korumak amacıyla, alıcı ve satıcı arasındaki ilk iletişimin Platform&apos;un
        mesajlaşma sistemi üzerinden başlatılması önerilir. İlanlık, Platform dışında (örn. üçüncü taraf mesajlaşma
        uygulamaları, telefon veya e-posta yoluyla) gerçekleştirilen görüşmeler, anlaşmalar ve ödemeler üzerinde
        kontrol sahibi değildir ve bu işlemlerden kaynaklanan zarar, dolandırıcılık veya anlaşmazlıklardan sorumlu
        tutulamaz. Kullanıcılara, ön bedel/depozito talep eden veya Platform dışında ödeme yapılmasını isteyen
        kişilere karşı dikkatli olmaları önemle tavsiye edilir.
      </p>

      <h2 id="icerikten-sorumluluk">8. İçerikten Sorumluluk</h2>
      <p>
        İlanlık.com&apos;da yer alan kullanıcıların oluşturduğu tüm içerik, görüş ve bilgilerin doğruluğu ve
        sorumluluğu içeriği oluşturan kullanıcıya aittir. İlanlık, kullanıcılar tarafından oluşturulan
        içeriklerden sorumlu değildir. İlanlık, yapay zeka destekli denetim ve moderasyon araçlarıyla içerik
        kalitesini artırmaya çalışsa da, bu bir editoryal onay veya garanti anlamına gelmez; Platform yalnızca
        kullanıcılar arasında bir aracılık ortamı sağlar ve hiçbir ilanın tarafı, satıcısı veya garantörü değildir.
      </p>

      <h2 id="hesap-askiya-alma">9. Hesabın Askıya Alınması ve Kapatılması</h2>
      <p>
        İlanlık, aşağıdaki durumlarda bir hesabı önceden bildirimde bulunmaksızın geçici olarak askıya alabilir veya
        kalıcı olarak kapatabilir:
      </p>
      <ul>
        <li>Bu Koşullar&apos;ın, Gizlilik Politikası&apos;nın veya yürürlükteki mevzuatın ihlal edilmesi.</li>
        <li>Tekrarlanan şikâyetlere konu olan veya yasaklı içerik/faaliyet barındıran kullanım.</li>
        <li>Hesap bilgilerinin yanlış, eksik veya başkasına ait olduğunun tespit edilmesi.</li>
        <li>Platform güvenliğini, diğer kullanıcıları veya üçüncü kişileri tehdit eden davranışlar.</li>
      </ul>
      <p>
        Kullanıcı, hesabını dilediği zaman Hesabım sayfası üzerinden veya destek@ilanlik.com adresine talepte
        bulunarak kapatabilir. Hesap kapatma, kullanıcının daha önce paylaştığı içeriklerden doğan sorumluluğunu
        ortadan kaldırmaz.
      </p>

      <h2 id="fikri-mulkiyet">10. Fikri Mülkiyet Hakları</h2>
      <p>
        Platform&apos;un tasarımı, yazılımı, logosu, marka adı ve bu Koşullar&apos;da aksi belirtilmeyen tüm içerik
        İlanlık&apos;a aittir ve fikri mülkiyet mevzuatı kapsamında korunur. Kullanıcılar tarafından yüklenen ilan
        içerikleri (fotoğraf, açıklama vb.) için kullanıcı, bu içerikleri Platform üzerinde görüntülenmek, depolanmak
        ve tanıtım amacıyla kullanılmak üzere İlanlık&apos;a münhasır olmayan, devredilebilir bir kullanım hakkı
        tanır. Bu hak, içeriğin fikri mülkiyetinin kullanıcıdan İlanlık&apos;a geçtiği anlamına gelmez.
      </p>

      <h2 id="sorumlulugun-sinirlandirilmasi">11. Sorumluluğun Sınırlandırılması</h2>
      <p>
        Platform &quot;olduğu gibi&quot; ve &quot;mevcut olduğu şekilde&quot; sunulmaktadır. İlanlık; kullanıcılar
        arasındaki alım-satım işlemlerinin sonucundan, ilan içeriğinin doğruluğundan, ürün/aracın kalitesinden,
        kullanıcılar arası iletişimden veya Platform&apos;un kesintisiz/hatasız çalışacağından kaynaklanan doğrudan
        veya dolaylı zararlardan sorumlu tutulamaz. İlanlık&apos;ın sorumluluğu, yürürlükteki mevzuatın izin verdiği
        en geniş ölçüde sınırlandırılmıştır.
      </p>

      <h2 id="degisiklik-hakki">12. Değişiklik Hakkı</h2>
      <p>
        İlanlık, bu Koşullar&apos;ı dilediği zaman güncelleme hakkını saklı tutar. Güncellenen koşullar bu sayfada
        yayınlandığı tarihte yürürlüğe girer. Önemli değişikliklerde kullanıcılar, Platform üzerinden veya e-posta
        yoluyla bilgilendirilmeye çalışılır. Güncellemelerden sonra Platform&apos;u kullanmaya devam edilmesi, güncel
        koşulların kabul edildiği anlamına gelir.
      </p>

      <h2 id="uyusmazlik">13. Uyuşmazlıkların Çözümü ve Yetkili Mahkeme</h2>
      <p>
        Bu Koşullar Türkiye Cumhuriyeti kanunlarına tabidir. Bu Koşullar&apos;dan veya Platform kullanımından
        kaynaklanan her türlü uyuşmazlığın çözümünde, Türkiye Cumhuriyeti sınırları içinde tüketici işlemlerinde
        ilgili mevzuat gereği yetkili olan Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri ile diğer hâllerde
        İstanbul (Anadolu) Mahkemeleri ve İcra Daireleri yetkilidir.
      </p>

      <h2 id="iletisim">14. İletişim</h2>
      <p>
        Bu Koşullar ile ilgili sorularınız için{" "}
        <a href="mailto:destek@ilanlik.com" className="font-medium text-brand underline hover:text-accent-dark">
          destek@ilanlik.com
        </a>{" "}
        adresinden veya{" "}
        <a href="/iletisim" className="font-medium text-brand underline hover:text-accent-dark">
          İletişim
        </a>{" "}
        sayfamızdaki form üzerinden bize ulaşabilirsiniz.
      </p>
    </LegalPage>
  );
}
