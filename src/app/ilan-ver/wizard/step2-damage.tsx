"use client";

import { CarDiagram } from "@/components/car-diagram";
import { FormSection, inputClass, labelClass } from "@/components/form-ui";
import type { WizardState } from "./wizard-types";

type Step2Props = {
  wizard: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
};

export function Step2Damage({ wizard, onChange }: Step2Props) {
  return (
    <FormSection
      title="Parça Durumu"
      description="Aracın hasar, boya ve değişen parça bilgilerini şema üzerinden işaretleyin."
    >
      <CarDiagram
        values={wizard.damageInfo}
        onChange={(partKey, status) =>
          onChange({ damageInfo: { ...wizard.damageInfo, [partKey]: status } })
        }
      />

      <div className="border-t border-slate-100 pt-5">
        <span className={labelClass}>TRAMER Hasar Kaydı</span>
        <label className="mb-3 flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={wizard.noTramer}
            onChange={(e) =>
              onChange({
                noTramer: e.target.checked,
                tramerAmount: e.target.checked ? "" : wizard.tramerAmount,
              })
            }
            className="h-4 w-4 accent-emerald-600"
          />
          Hasar kaydı yok
        </label>

        {!wizard.noTramer && (
          <div className="max-w-xs">
            <label htmlFor="tramerAmount" className={labelClass}>
              TRAMER Hasar Kaydı Tutarı (₺)
            </label>
            <input
              id="tramerAmount"
              type="number"
              min={0}
              value={wizard.tramerAmount}
              onChange={(e) => onChange({ tramerAmount: e.target.value })}
              placeholder="15000"
              className={inputClass}
            />
          </div>
        )}
      </div>
    </FormSection>
  );
}
