import { ChevronDownIcon } from "./icons";

// autoevolution kaynaklı ham veri İngilizce kategori/alan adları kullanır.
// En sık görülen olanları çeviriyoruz; eşleşmeyenler (nadir alanlar) ham
// haliyle (sonundaki ":" temizlenerek) gösterilir - veri kaybı olmaz.
const CATEGORY_LABELS: Record<string, string> = {
  "Engine Specs": "Motor",
  "Performance Specs": "Performans",
  "Transmission Specs": "Aktarma Organları",
  "Brakes Specs": "Frenler",
  "Tires Specs": "Lastikler",
  Dimensions: "Boyutlar",
  "Weight Specs": "Ağırlık",
  "Fuel Economy (Nedc)": "Yakıt Tüketimi (NEDC)",
  "Fuel Economy (Wltp)": "Yakıt Tüketimi (WLTP)",
  "Power System Specs": "Elektrikli Güç Sistemi",
};

const FIELD_LABELS: Record<string, string> = {
  "Cylinders:": "Silindir",
  "Displacement:": "Hacim",
  "Power:": "Güç",
  "Torque:": "Tork",
  "Fuel System:": "Yakıt Sistemi",
  "Fuel:": "Yakıt",
  "Fuel Capacity:": "Yakıt Deposu",
  "Fuel Capacity (Optional):": "Yakıt Deposu (Opsiyonel)",
  "Fuel Capacity (Cng):": "Yakıt Deposu (CNG)",
  "Cng Cylinder Capacity:": "CNG Tüp Kapasitesi",
  "Total Maximum Power:": "Toplam Azami Güç",
  "Electrical Motor Power:": "Elektrik Motor Gücü",
  "Electrical Motor Torque:": "Elektrik Motor Torku",
  "Total Maximum Torque:": "Toplam Azami Tork",
  "Top Speed:": "Azami Hız",
  "Top Speed (Electrical):": "Azami Hız (Elektrikli)",
  "Acceleration 0-62 Mph (0-100 Kph):": "0-100 km/s Hızlanma",
  "Drive Type:": "Çekiş",
  "Gearbox:": "Vites Kutusu",
  "Front:": "Ön",
  "Rear:": "Arka",
  "Tire Size:": "Lastik Ölçüsü",
  "Length:": "Uzunluk",
  "Width:": "Genişlik",
  "Height:": "Yükseklik",
  "Front/Rear Track:": "Ön/Arka İz Genişliği",
  "Wheelbase:": "Dingil Mesafesi",
  "Ground Clearance:": "Yerden Yükseklik",
  "Cargo Volume:": "Bagaj Hacmi",
  "Aerodynamics (Frontal Area):": "Ön Alan",
  "Aerodynamics (Cd):": "Hava Sürtünme Katsayısı (Cd)",
  "Turning Circle:": "Dönüş Çapı",
  "Turning Circle (Wall To Wall):": "Dönüş Çapı (Duvardan Duvara)",
  "Turning Circle (Curb To Curb):": "Dönüş Çapı (Kaldırımdan Kaldırıma)",
  "Unladen Weight:": "Boş Ağırlık",
  "Gross Weight Limit:": "Azami Ağırlık",
  "City:": "Şehir İçi",
  "Highway:": "Şehir Dışı",
  "Combined:": "Ortalama",
  "Low:": "Düşük Hız",
  "Medium:": "Orta Hız",
  "High:": "Yüksek Hız",
  "Extra High:": "Çok Yüksek Hız",
  "Co2 Emissions:": "CO2 Emisyonu",
  "Co2 Emissions (Combined):": "CO2 Emisyonu (Ortalama)",
  "Co2 Emissions (Low):": "CO2 Emisyonu (Düşük Hız)",
  "Co2 Emissions (Medium):": "CO2 Emisyonu (Orta Hız)",
  "Co2 Emissions (High):": "CO2 Emisyonu (Yüksek Hız)",
  "Co2 Emissions (Extra High):": "CO2 Emisyonu (Çok Yüksek Hız)",
  "Power Pack:": "Batarya Paketi",
  "Nominal Capacity:": "Nominal Kapasite",
  "Maximum Capacity:": "Azami Kapasite",
  "Range:": "Menzil",
  "Charger Type:": "Şarj Tipi",
  "Charging Time (Normal):": "Şarj Süresi (Normal)",
  "Charging Time (Quick):": "Şarj Süresi (Hızlı)",
};

function fieldLabel(key: string): string {
  return FIELD_LABELS[key] ?? key.replace(/:$/, "");
}

function cleanValue(value: string): string {
  return value.replace(/\r\n/g, " / ");
}

export function VehicleTrimSpecs({ rawSpecsJson }: { rawSpecsJson: string | null }) {
  if (!rawSpecsJson) return null;

  let specs: Record<string, Record<string, string>>;
  try {
    specs = JSON.parse(rawSpecsJson);
  } catch {
    return null;
  }

  const categories = Object.entries(specs).filter(([, fields]) => fields && Object.keys(fields).length > 0);
  if (categories.length === 0) return null;

  return (
    <details className="group rounded-lg border border-slate-100">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
        Detaylı Teknik Özellikler
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-4 border-t border-slate-100 px-4 py-4">
        {categories.map(([category, fields]) => (
          <div key={category}>
            <p className="mb-1.5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
              {CATEGORY_LABELS[category] ?? category}
            </p>
            <dl className="divide-y divide-slate-50">
              {Object.entries(fields).map(([key, value]) => (
                <div key={key} className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
                  <dt className="shrink-0 text-slate-500">{fieldLabel(key)}</dt>
                  <dd
                    className="min-w-0 flex-1 truncate text-right font-medium text-foreground"
                    title={cleanValue(value)}
                  >
                    {cleanValue(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </details>
  );
}
