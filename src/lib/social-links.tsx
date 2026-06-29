import { FacebookIcon, InstagramIcon, XIcon, YouTubeIcon } from "@/components/icons";

// ============================================================================
//  SOSYAL MEDYA HESAP BAĞLANTILARI
//  Aşağıdaki linkleri kendi gerçek profil adreslerinizle değiştirin.
//  - Bir platformun ikonunu KALDIRMAK için href'i "" (boş) bırakın ya da
//    ilgili satırı silin; boş href'li platformlar footer'da gösterilmez.
//  - Yeni bir platform eklemek için icons.tsx'e marka ikonunu ekleyip
//    buraya yeni bir satır yazın.
// ============================================================================

const INSTAGRAM_URL = "https://www.instagram.com/ilanliocom";
const FACEBOOK_URL = "https://www.facebook.com/ilanliocom";
const X_URL = "https://x.com/ilanliocom";
const YOUTUBE_URL = "https://www.youtube.com/@ilanliocom";

export type SocialLink = {
  label: string;
  href: string;
  icon: (props: { className?: string }) => React.ReactElement;
};

// Yalnızca href'i dolu olan platformlar render edilir (boş/çalışmayan link
// gösterilmez).
export const SOCIAL_LINKS: SocialLink[] = [
  { label: "Instagram", href: INSTAGRAM_URL, icon: InstagramIcon },
  { label: "Facebook", href: FACEBOOK_URL, icon: FacebookIcon },
  { label: "X (Twitter)", href: X_URL, icon: XIcon },
  { label: "YouTube", href: YOUTUBE_URL, icon: YouTubeIcon },
].filter((s) => s.href.trim() !== "");
