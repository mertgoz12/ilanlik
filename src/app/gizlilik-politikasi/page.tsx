import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Gizlilik Politikası - İlanlık" };

const SECTIONS = [
  { id: "giris", title: "Giriş" },
  { id: "toplanan-veriler", title: "Toplanan Veriler" },
  { id: "isleme-amaclari", title: "Verilerin Toplanma ve İşlenme Amaçları" },
  { id: "saklama-ve-guvenlik", title: "Verilerin Saklanması ve Güvenliği" },
  { id: "veri-paylasimi", title: "Verilerin Paylaşıldığı Taraflar" },
  { id: "cerezler", title: "Çerez Kullanımı" },
  { id: "saklama-suresi", title: "Veri Saklama Süresi" },
  { id: "kullanici-haklari", title: "Kullanıcı Hakları" },
  { id: "politika-degisiklikleri", title: "Politika Değişiklikleri" },
  { id: "iletisim", title: "İletişim" },
];

export default function GizlilikPolitikasiPage() {
  return (
    <LegalPage title="Gizlilik Politikası" updatedAt="17 Haziran 2026" sections={SECTIONS}>
      <h2 id="giris">1. Giriş</h2>
      <p>
        Bu Gizlilik Politikası, İlanlık (&quot;İlanlık&quot;, &quot;biz&quot;) tarafından işletilen ilanlik.com
        platformunu (&quot;Platform&quot;) kullanırken hangi kişisel verilerinizin toplandığını, bu verilerin nasıl
        kullanıldığını, kimlerle paylaşılabileceğini ve verileriniz üzerindeki haklarınızı açıklar. Platform&apos;u
        kullanarak bu politikada açıklanan veri işleme faaliyetlerini kabul etmiş olursunuz. Kişisel verilerinizin
        6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamındaki işlenme esasları için ayrıca{" "}
        <a href="/kvkk" className="font-medium text-brand underline hover:text-accent-dark">
          KVKK Aydınlatma Metni
        </a>
        &apos;ni inceleyebilirsiniz.
      </p>

      <h2 id="toplanan-veriler">2. Toplanan Veriler</h2>
      <p>Platform üzerinden aşağıdaki kişisel veri kategorileri toplanabilir:</p>
      <ul>
        <li><strong>Kimlik ve İletişim Bilgileri:</strong> Ad-soyad, e-posta adresi, telefon numarası.</li>
        <li><strong>Konum Bilgileri:</strong> İl ve ilçe bilgisi (ilan ve profil bilgilerinizde belirttiğiniz şekilde).</li>
        <li><strong>İlan İçerikleri:</strong> Yayınladığınız ilanlara ait başlık, açıklama, fiyat, fotoğraf ve teknik özellik bilgileri.</li>
        <li><strong>Mesajlaşma Verileri:</strong> Platform üzerindeki alıcı-satıcı mesajlaşma sisteminde paylaştığınız iletiler.</li>
        <li><strong>Hesap Verileri:</strong> Kullanıcı adı, şifre (şifrelenmiş olarak), üyelik tarihi, profil tercihleri.</li>
        <li><strong>Kullanım ve Çerez Verileri:</strong> Platform&apos;u nasıl kullandığınıza ilişkin teknik veriler (IP adresi, tarayıcı bilgisi, ziyaret edilen sayfalar, çerezler aracılığıyla toplanan tercihler).</li>
        <li><strong>İşlem ve Destek Verileri:</strong> İletişim formu, şikâyet bildirimi veya destek talepleri kapsamında paylaştığınız bilgiler.</li>
      </ul>

      <h2 id="isleme-amaclari">3. Verilerin Toplanma ve İşlenme Amaçları</h2>
      <p>Topladığımız kişisel veriler aşağıdaki amaçlarla işlenir:</p>
      <ul>
        <li><strong>Üyelik Yönetimi:</strong> Hesabınızın oluşturulması, doğrulanması, güvenliğinin sağlanması ve sürdürülmesi.</li>
        <li><strong>İlan Yayınlama:</strong> İlanlarınızın oluşturulması, yayınlanması, düzenlenmesi ve diğer kullanıcılara gösterilmesi.</li>
        <li><strong>Alıcı-Satıcı İletişimi:</strong> Mesajlaşma sistemi üzerinden alıcı ve satıcıların güvenli şekilde iletişim kurabilmesi.</li>
        <li><strong>Dolandırıcılık Önleme ve Güvenlik:</strong> Sahte hesap, sahte ilan, dolandırıcılık girişimi ve kötüye kullanımın tespit edilip önlenmesi.</li>
        <li><strong>Yapay Zeka Destekli İlan Analizi:</strong> İlan içeriklerinin fiyat tutarlılığı, hasar/tutarsızlık tespiti ve güven puanı hesaplaması amacıyla otomatik olarak analiz edilmesi.</li>
        <li><strong>Müşteri Desteği:</strong> Destek taleplerinizin ve şikâyetlerinizin yanıtlanması.</li>
        <li><strong>Yasal Yükümlülükler:</strong> Mevzuattan kaynaklanan saklama, bilgilendirme ve raporlama yükümlülüklerinin yerine getirilmesi.</li>
        <li><strong>Hizmet İyileştirme:</strong> Platform performansının analiz edilmesi ve kullanıcı deneyiminin geliştirilmesi.</li>
      </ul>

      <h2 id="saklama-ve-guvenlik">4. Verilerin Saklanması ve Güvenliği</h2>
      <p>
        Kişisel verileriniz, İlanlık&apos;ın veya hizmet aldığı altyapı/hosting sağlayıcılarının sunucularında, yetkisiz
        erişime, kayba, kötüye kullanıma veya ifşaya karşı makul teknik ve idari güvenlik tedbirleriyle (erişim
        kısıtlama, şifreleme, düzenli yedekleme vb.) korunarak saklanır. Şifreniz veritabanında okunabilir biçimde
        tutulmaz; tek yönlü şifreleme (hash) yöntemiyle saklanır. Hiçbir iletim veya depolama yönteminin %100
        güvenli olmadığını hatırlatmak isteriz; buna karşın güvenliği güncel teknik standartlara uygun şekilde
        sağlamaya azami özeni gösteriyoruz.
      </p>

      <h2 id="veri-paylasimi">5. Verilerin Paylaşıldığı Taraflar</h2>
      <p>Kişisel verileriniz, aşağıda belirtilen amaç ve kapsamla sınırlı olarak üçüncü taraflarla paylaşılabilir:</p>
      <ul>
        <li>
          <strong>Yapay Zeka Servis Sağlayıcıları:</strong> İlan içeriklerinizin (açıklama, fotoğraf, teknik
          özellikler) fiyat tutarlılığı ve hasar/tutarsızlık analizinin yapılabilmesi için, ilana ait veriler API
          üzerinden bir yapay zeka servis sağlayıcısına iletilir. Bu sağlayıcı, verileri yalnızca analiz isteğini
          gerçekleştirmek amacıyla işler.
        </li>
        <li>
          <strong>Hosting ve Altyapı Sağlayıcıları:</strong> Platform&apos;un çalışması için verileriniz, sunucu,
          depolama ve içerik dağıtım hizmeti veren hosting/bulut altyapı sağlayıcılarında barındırılır.
        </li>
        <li>
          <strong>Diğer Kullanıcılar:</strong> İlan ve profilinizde paylaştığınız bilgiler (ad, ilan içerikleri,
          konum bilgisi gibi) Platform&apos;u ziyaret eden diğer kullanıcılar tarafından görüntülenebilir.
          Mesajlaşma içerikleriniz yalnızca ilgili konuşmanın tarafı olan kullanıcıyla paylaşılır.
        </li>
        <li>
          <strong>Yetkili Kamu Kurumları:</strong> Yürürlükteki mevzuat gereği talep edilmesi hâlinde, yasal
          yükümlülüklerimizi yerine getirmek amacıyla yetkili kamu kurum ve kuruluşlarıyla paylaşım yapılabilir.
        </li>
      </ul>
      <p>
        İlanlık, kişisel verilerinizi yukarıda belirtilenler dışında, açık rızanız olmadan üçüncü kişilere pazarlama
        amacıyla satmaz veya kiralamaz.
      </p>

      <h2 id="cerezler">6. Çerez Kullanımı</h2>
      <p>
        Platform, oturum yönetimi, tercihlerin hatırlanması ve kullanım istatistiklerinin analiz edilmesi için
        çerezler kullanır. Çerez türleri, kullanım amaçları ve tercihlerinizi nasıl yönetebileceğiniz hakkında
        detaylı bilgiye{" "}
        <a href="/cerez-politikasi" className="font-medium text-brand underline hover:text-accent-dark">
          Çerez Politikası
        </a>{" "}
        sayfasından ulaşabilirsiniz.
      </p>

      <h2 id="saklama-suresi">7. Veri Saklama Süresi</h2>
      <p>
        Kişisel verileriniz, işlenme amacının gerektirdiği süre ve ilgili mevzuatta öngörülen yasal saklama
        süreleri boyunca saklanır. Hesabınızı kapattığınızda, ilan ve hesap verileriniz, yasal yükümlülüklerin
        gerektirdiği süre (örn. olası uyuşmazlıklara karşı ispat süresi) ve dolandırıcılık önleme amacıyla makul bir
        süre için saklanabilir; bu sürenin sonunda silinir veya anonim hâle getirilir.
      </p>

      <h2 id="kullanici-haklari">8. Kullanıcı Hakları</h2>
      <p>KVKK ve ilgili mevzuat kapsamında kişisel verilerinizle ilgili olarak şu haklara sahipsiniz:</p>
      <ul>
        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
        <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
        <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
        <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
        <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
        <li>Mevzuatta öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme,</li>
        <li>Düzeltme/silme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
        <li>İşlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi nedeniyle aleyhinize bir sonuç ortaya çıkmasına itiraz etme,</li>
        <li>Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme.</li>
      </ul>
      <p>
        Bu haklarınızı kullanmak için{" "}
        <a href="/kvkk" className="font-medium text-brand underline hover:text-accent-dark">
          KVKK Aydınlatma Metni
        </a>
        &apos;nde belirtilen başvuru yöntemlerini kullanabilirsiniz.
      </p>

      <h2 id="politika-degisiklikleri">9. Politika Değişiklikleri</h2>
      <p>
        İlanlık, bu Gizlilik Politikası&apos;nı mevzuat değişiklikleri veya Platform&apos;daki yenilikler doğrultusunda
        güncelleme hakkını saklı tutar. Güncellemeler bu sayfada yayınlandığı anda yürürlüğe girer. Politikayı
        düzenli olarak gözden geçirmenizi öneririz.
      </p>

      <h2 id="iletisim">10. İletişim</h2>
      <p>
        Gizlilik uygulamalarımızla ilgili sorularınız için{" "}
        <a href="mailto:destek@ilanlik.com" className="font-medium text-brand underline hover:text-accent-dark">
          destek@ilanlik.com
        </a>{" "}
        veya kişisel veri başvurularınız için{" "}
        <a href="mailto:kvkk@ilanlik.com" className="font-medium text-brand underline hover:text-accent-dark">
          kvkk@ilanlik.com
        </a>{" "}
        adresine yazabilirsiniz.
      </p>
    </LegalPage>
  );
}
