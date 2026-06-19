"use client";

import { FormSection } from "@/components/form-ui";
import { EQUIPMENT_GROUPS } from "@/lib/car-data";
import type { WizardState } from "./wizard-types";

type Step3Props = {
  wizard: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
};

export function Step3Equipment({ wizard, onChange }: Step3Props) {
  function toggle(key: string) {
    const has = wizard.equipment.includes(key);
    onChange({
      equipment: has ? wizard.equipment.filter((k) => k !== key) : [...wizard.equipment, key],
    });
  }

  return (
    <div className="space-y-6">
      {EQUIPMENT_GROUPS.map((group) => (
        <FormSection key={group.title} title={group.title}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => (
              <label
                key={item.key}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors has-checked:border-emerald-500 has-checked:bg-emerald-50 has-checked:text-emerald-700"
              >
                <input
                  type="checkbox"
                  checked={wizard.equipment.includes(item.key)}
                  onChange={() => toggle(item.key)}
                  className="h-4 w-4 accent-emerald-600"
                />
                {item.label}
              </label>
            ))}
          </div>
        </FormSection>
      ))}
    </div>
  );
}
