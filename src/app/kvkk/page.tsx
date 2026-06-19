import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "KVKK Aydınlatma Metni - İlanlık" };

const SECTIONS = [
  { id: "veri-sorumlusu", title: "Veri Sorumlusu" },
  { id: "islenen-veriler", title: "İşlenen Kişisel Veriler" },
  { id: "isleme-amaclari", title: "Kişisel Verilerin İşlenme Amaçları" },
  { id: "hukuki-sebepler", title: "İşlemenin Hukuki Sebepleri" },
  { id: "aktarim", title: "Kişisel Verilerin Aktarıldığı Taraflar" },
  { id: "toplama-yontemi", title: "Kişisel Veri Toplamanın Yöntemi" },
  { id: "haklar", title: "Veri Sahibinin Hakları (Madde 11)" },
  { id: "basvuru-yontemi", title: "Başvuru Yöntemi" },
  { id: "basvuru-sureci", title: "Başvurulara Cevap Verme Süreci" },
];

export default function KvkkPage() {
  return (
    <LegalPage title="KVKK Aydınlatma Metni" updatedAt="17 Haziran 2026" sections={SECTIONS}>
      <h2 id="veri-sorumlusu">1. Veri Sorumlusu</h2>
      <p>
        6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca kişisel verileriniz; veri
        sorumlusu sıfatıyla <strong>İlanlık (ilanlik.com)</strong> (&quot;İlanlık&quot;, &quot;veri sorumlusu&quot;)
        tarafından, aşağıda açıklanan kapsam ve şartlarla işlenebilecektir. İlanlık&apos;a KVKK kapsamındaki
        taleplerinizi <strong>kvkk@ilanlik.com</strong> adresine, genel destek taleplerinizi ise{" "}
        <strong>destek@ilanlik.com</strong> adresine iletebilirsiniz.
      </p>

      <h2 id="islenen-veriler">2. İşlenen Kişisel Veriler</h2>
      <p>Platform üzerinden, üyelik ve kullanım ilişkiniz kapsamında aşağıdaki kişisel veri kategorileri işlenmektedir:</p>
      <ul>
        <li><strong>Kimlik Verisi:</strong> Ad, soyad.</li>
        <li><strong>İletişim Verisi:</strong> E-posta adresi, telefon numarası.</li>
        <li><strong>Lokasyon Verisi:</strong> İl, ilçe bilgisi.</li>
        <li><strong>Müşteri İşlem Verisi:</strong> İlan içerikleri (başlık, açıklama, fiyat, fotoğraf, teknik özellikler), mesajlaşma kayıtları, favori/arama geçmişi.</li>
        <li><strong>İşlem Güvenliği Verisi:</strong> Şifre (şifrelenmiş/hash olarak), oturum açma kayıtları, IP adresi, cihaz/tarayıcı bilgisi.</li>
        <li><strong>Pazarlama Verisi:</strong> Açık rızanızla yönetilen pazarlama amaçlı çerez verileri (bkz. Çerez Politikası).</li>
        <li><strong>Talep/Şikâyet Verisi:</strong> İletişim formu, destek talebi veya şikâyet bildirimi kapsamında paylaştığınız bilgiler.</li>
      </ul>
      <p>
        İlanlık, ırk, etnik köken, sağlık, biyometrik veri gibi KVKK madde 6 kapsamındaki <strong>özel nitelikli
        kişisel verileri</strong> Platform hizmetleri kapsamında toplamamaktadır.
      </p>

      <h2 id="isleme-amaclari">3. Kişisel Verilerin İşlenme Amaçları</h2>
      <p>Kişisel verileriniz şu amaçlarla işlenmektedir:</p>
      <ul>
        <li>Üyelik kaydının oluşturulması ve hesap güvenliğinin sağlanması,</li>
        <li>İlan yayınlama, düzenleme ve görüntülenme süreçlerinin yürütülmesi,</li>
        <li>Alıcı ve satıcı arasındaki iletişimin Platform üzerinden güvenli şekilde sağlanması,</li>
        <li>İlan içeriklerinin yapay zeka destekli analizle fiyat tutarlılığının ve güven puanının hesaplanması,</li>
        <li>Dolandırıcılık, sahte ilan ve kötüye kullanımın tespiti ile önlenmesi,</li>
        <li>Müşteri destek ve şikâyet süreçlerinin yönetilmesi,</li>
        <li>Platform güvenliğinin ve hizmet kalitesinin sağlanması, hizmetlerin geliştirilmesi,</li>
        <li>Yasal yükümlülüklerin ve yetkili kurum taleplerinin yerine getirilmesi.</li>
      </ul>

      <h2 id="hukuki-sebepler">4. İşlemenin Hukuki Sebepleri</h2>
      <p>
        Kişisel verileriniz, KVKK&apos;nın 5. ve 6. maddelerinde belirtilen kişisel veri işleme şartları kapsamında,
        aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:
      </p>
      <ul>
        <li><strong>Sözleşmenin kurulması/ifası (m. 5/2-c):</strong> Üyelik ve ilan yayınlama ilişkisinin kurulması ve yürütülmesi için verilerinizin işlenmesi gereklidir.</li>
        <li><strong>Hukuki yükümlülük (m. 5/2-ç):</strong> İlanlık&apos;ın tabi olduğu mevzuattan kaynaklanan saklama ve bilgilendirme yükümlülükleri.</li>
        <li><strong>Bir hakkın tesisi/korunması (m. 5/2-e):</strong> Uyuşmazlık, dolandırıcılık veya hukuki talep hâllerinde delil olarak kullanılması.</li>
        <li><strong>Veri sorumlusunun meşru menfaati (m. 5/2-f):</strong> Platform güvenliğinin sağlanması, yapay zeka destekli analizle hizmet kalitesinin artırılması, temel hak ve özgürlüklerinize zarar vermemek kaydıyla.</li>
        <li><strong>Açık rıza (m. 5/1):</strong> Yukarıdaki sebeplerle açıklanamayan işlemler için (örn. pazarlama amaçlı çerezler) açık rızanız alınır.</li>
      </ul>
      <p>
        Yukarıda belirtildiği üzere İlanlık, KVKK madde 6 kapsamındaki özel nitelikli kişisel veri işlememektedir.
      </p>

      <h2 id="aktarim">5. Kişisel Verilerin Aktarıldığı Taraflar</h2>
      <p>
        Kişisel verileriniz, KVKK&apos;nın 8. ve 9. maddelerinde belirtilen şartlara uygun olarak ve yalnızca
        belirtilen amaçların gerçekleştirilmesiyle sınırlı şekilde aşağıdaki taraflara aktarılabilir:
      </p>
      <ul>
        <li>
          <strong>Yapay zeka servis sağlayıcısı:</strong> İlan içeriklerinin fiyat tutarlılığı ve hasar/tutarsızlık
          analizinin yapılabilmesi amacıyla, ilana ait veriler API aracılığıyla bir yapay zeka servis sağlayıcısına
          aktarılır.
        </li>
        <li>
          <strong>Hosting/altyapı sağlayıcıları:</strong> Verilerinizin barındırıldığı sunucu, depolama ve bulut
          altyapısı hizmeti veren tedarikçiler.
        </li>
        <li>
          <strong>Yetkili kamu kurum ve kuruluşları:</strong> Hukuki yükümlülüklerimiz kapsamında, talep edilmesi
          hâlinde ilgili mevzuatta yetkili kılınan kurumlar.
        </li>
        <li>
          <strong>Hukuk ve danışmanlık hizmeti aldığımız üçüncü kişiler:</strong> Hukuki süreçlerin yürütülmesi
          amacıyla sınırlı olarak.
        </li>
      </ul>

      <h2 id="toplama-yontemi">6. Kişisel Veri Toplamanın Yöntemi</h2>
      <p>
        Kişisel verileriniz; Platform&apos;a üye olurken doldurduğunuz formlar, ilan verme/düzenleme ekranları,
        mesajlaşma sistemi, iletişim formu ve çerezler ile log kayıtları aracılığıyla elektronik ortamda, otomatik
        veya kısmen otomatik yöntemlerle toplanmaktadır.
      </p>

      <h2 id="haklar">7. Veri Sahibinin Hakları (Madde 11)</h2>
      <p>KVKK&apos;nın 11. maddesi uyarınca İlanlık&apos;a başvurarak şu haklarınızı kullanabilirsiniz:</p>
      <ul>
        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
        <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
        <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
        <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
        <li>Eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme,</li>
        <li>KVKK madde 7 ve ilgili mevzuat hükümlerine uygun olarak silinmesini veya yok edilmesini isteme,</li>
        <li>Düzeltme, silme ve yok etme işlemlerinin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
        <li>İşlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
        <li>Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme.</li>
      </ul>

      <h2 id="basvuru-yontemi">8. Başvuru Yöntemi</h2>
      <p>
        Yukarıdaki haklarınızı kullanmak için talebinizi yazılı olarak veya kayıtlı elektronik posta (KEP) adresi,
        mobil imza, güvenli elektronik imza ya da İlanlık&apos;a önceden bildirdiğiniz ve sistemimizde kayıtlı
        bulunan elektronik posta adresinizi kullanmak suretiyle{" "}
        <a href="mailto:kvkk@ilanlik.com" className="font-medium text-brand underline hover:text-accent-dark">
          kvkk@ilanlik.com
        </a>{" "}
        adresine iletebilirsiniz. Başvurunuzda; ad-soyad, T.C. kimlik numarası (yabancılar için pasaport numarası
        veya kimlik bilgisi), tebligata esas yerleşim yeri/iş yeri adresi, varsa bildirime esas e-posta adresi/telefon
        numarası ve talep konusunun açık ve anlaşılır şekilde belirtilmesi gerekmektedir. Kimliğinizi doğrulayıcı
        bilgi ve belgelerin eksik olması hâlinde başvurunuz işleme alınamayabilir.
      </p>

      <h2 id="basvuru-sureci">9. Başvurulara Cevap Verme Süreci</h2>
      <p>
        İlanlık, başvurunuzu KVKK madde 13 uyarınca talebin niteliğine göre en kısa sürede ve en geç{" "}
        <strong>30 (otuz) gün</strong> içinde, ücretsiz olarak sonuçlandırır. Ancak işlemin ayrıca bir maliyet
        gerektirmesi hâlinde, Kişisel Verileri Koruma Kurulu tarafından belirlenen tarifedeki ücret talep
        edilebilir. Başvurunuz kabul edilir veya gerekçesi açıklanarak reddedilir; cevabımız başvurunuzda
        belirttiğiniz adrese yazılı olarak veya elektronik ortamda iletilir.
      </p>
    </LegalPage>
  );
}
