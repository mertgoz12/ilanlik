import { FUEL_TYPES, TRANSMISSIONS } from "@/lib/car-data";
import type { WizardState } from "./wizard-types";

const currentYear = new Date().getFullYear();

const FUEL_TYPE_VALUES = FUEL_TYPES as readonly string[];
const TRANSMISSION_VALUES = TRANSMISSIONS as readonly string[];

export function effectiveTitle(wizard: WizardState): string {
  return wizard.title.trim() || [wizard.brand, wizard.series, wizard.model, wizard.year].filter(Boolean).join(" ");
}

export function validateStep1(wizard: WizardState): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!wizard.brand.trim()) errors.brand = "Marka seçin";
  if (!wizard.model.trim()) errors.model = "Model seçin";

  const year = Number(wizard.year);
  if (!wizard.year.trim() || !Number.isInteger(year) || year < 1970 || year > currentYear + 1) {
    errors.year = "Geçerli bir yıl girin";
  }

  const km = Number(wizard.km);
  if (!wizard.km.trim() || !Number.isFinite(km) || km < 0 || km > 2_000_000) {
    errors.km = "Geçerli bir km değeri girin";
  }

  if (!FUEL_TYPE_VALUES.includes(wizard.fuelType)) errors.fuelType = "Yakıt tipi seçin";
  if (!TRANSMISSION_VALUES.includes(wizard.transmission)) errors.transmission = "Vites tipi seçin";

  return errors;
}

export function validateStep4(wizard: WizardState): Record<string, string> {
  const errors: Record<string, string> = {};

  if (effectiveTitle(wizard).length < 5) {
    errors.title = "Başlık en az 5 karakter olmalı";
  }

  return errors;
}

export function validateStep5(wizard: WizardState): Record<string, string> {
  const errors: Record<string, string> = {};

  const price = Number(wizard.price.replace(/\D/g, ""));
  if (!wizard.price.trim() || !Number.isFinite(price) || price < 1 || price > 1_000_000_000) {
    errors.price = "Geçerli bir fiyat girin";
  }

  if (!wizard.il.trim()) errors.il = "İl seçin";
  if (!wizard.ilce.trim()) errors.ilce = "İlçe seçin";

  return errors;
}
