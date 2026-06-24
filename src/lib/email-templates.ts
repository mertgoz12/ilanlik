const BRAND_NAVY = "#1b2a4a";
const BRAND_AMBER = "#f5a623";
const SITE_URL = "https://ilanlio.com";

// Tüm e-postaların paylaştığı ortak iskelet: lacivert üst şerit + logo,
// beyaz kart içinde içerik, sarı CTA butonu, alt bilgi notu. Mail
// istemcileri (Gmail/Outlook) modern CSS desteklemediği için tablo tabanlı,
// inline style'lı klasik bir HTML e-posta yapısı kullanılır.
export function renderEmailLayout(options: {
  previewText: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footnote?: string;
}): string {
  const { previewText, heading, bodyHtml, ctaLabel, ctaUrl, footnote } = options;

  return `<!DOCTYPE html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${heading}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${previewText}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background-color:${BRAND_NAVY};padding:28px 32px;text-align:center;">
                <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                  ilan<span style="color:${BRAND_AMBER};">lio</span><span style="color:#94a3b8;font-weight:600;">.com</span>
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 8px;">
                <h1 style="margin:0 0 16px;font-size:20px;line-height:28px;color:${BRAND_NAVY};">${heading}</h1>
                <div style="font-size:15px;line-height:24px;color:#475569;">${bodyHtml}</div>
              </td>
            </tr>
            ${
              ctaLabel && ctaUrl
                ? `<tr>
              <td style="padding:8px 32px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:10px;background-color:${BRAND_AMBER};">
                      <a href="${ctaUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:${BRAND_NAVY};text-decoration:none;">
                        ${ctaLabel}
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:16px 0 0;font-size:12px;line-height:18px;color:#94a3b8;word-break:break-all;">
                  Buton çalışmıyorsa şu bağlantıyı tarayıcınıza yapıştırın:<br />
                  <a href="${ctaUrl}" style="color:#64748b;">${ctaUrl}</a>
                </p>
              </td>
            </tr>`
                : ""
            }
            <tr>
              <td style="padding:20px 32px 28px;border-top:1px solid #f1f5f9;">
                <p style="margin:0;font-size:12px;line-height:18px;color:#94a3b8;">
                  ${footnote ?? "Bu e-postayı siz talep etmediyseniz güvenle yoksayabilirsiniz."}
                </p>
                <p style="margin:12px 0 0;font-size:12px;color:#cbd5e1;">
                  <a href="${SITE_URL}" style="color:#cbd5e1;text-decoration:underline;">ilanlio.com</a> ·
                  Yapay zeka destekli güvenli ilan platformu
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
