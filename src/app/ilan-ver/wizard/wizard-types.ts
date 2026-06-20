import { ALL_DAMAGE_PART_KEYS, type DamagePartStatus } from "@/lib/car-data";

export type WizardState = {
  // Araç kataloğu kademeli seçim id'leri (sadece UI state, sunucuya gönderilmez)
  brandId: string;
  modelId: string;
  generationId: string;
  trimId: string;
  // Düz araç bilgileri (sunucuya gönderilir)
  brand: string;
  model: string;
  series: string;
  year: string;
  km: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  engineVolume: string;
  enginePower: string;
  drivetrain: string;
  vehicleCondition: string;
  doorCount: string;
  plateOrigin: string;
  fromWho: string;
  exchange: string;
  warranty: string;
  damageInfo: Record<string, DamagePartStatus>;
  tramerAmount: string;
  noTramer: boolean;
  equipment: string[];
  title: string;
  description: string;
  price: string;
  il: string;
  ilce: string;
};

export const DEFAULT_WIZARD_STATE: WizardState = {
  brandId: "",
  modelId: "",
  generationId: "",
  trimId: "",
  brand: "",
  model: "",
  series: "",
  year: "",
  km: "",
  fuelType: "",
  transmission: "",
  bodyType: "",
  color: "",
  engineVolume: "",
  enginePower: "",
  drivetrain: "",
  vehicleCondition: "",
  doorCount: "",
  plateOrigin: "",
  fromWho: "",
  exchange: "",
  warranty: "",
  damageInfo: Object.fromEntries(ALL_DAMAGE_PART_KEYS.map((key) => [key, "orijinal"])) as Record<
    string,
    DamagePartStatus
  >,
  tramerAmount: "",
  noTramer: true,
  equipment: [],
  title: "",
  description: "",
  price: "",
  il: "",
  ilce: "",
};

export const DRAFT_KEY = "ilanlio:ilan-ver:vasita-wizard:v1";

export type WizardDraft = {
  step: number;
  wizard: WizardState;
  savedAt: string;
};

export function loadDraft(): WizardDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WizardDraft>;
    if (!parsed.wizard || typeof parsed.step !== "number") return null;
    return {
      step: Math.min(5, Math.max(1, parsed.step)),
      wizard: {
        ...DEFAULT_WIZARD_STATE,
        ...parsed.wizard,
        damageInfo: { ...DEFAULT_WIZARD_STATE.damageInfo, ...parsed.wizard.damageInfo },
        equipment: Array.isArray(parsed.wizard.equipment) ? parsed.wizard.equipment : [],
      },
      savedAt: parsed.savedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveDraft(step: number, wizard: WizardState) {
  if (typeof window === "undefined") return;
  const draft: WizardDraft = { step, wizard, savedAt: new Date().toISOString() };
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_KEY);
}

export function fieldClass(base: string, error?: string): string {
  return error ? `${base} border-red-400 focus:border-red-500 focus:ring-red-500/20` : base;
}
