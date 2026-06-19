"use client";

import { errorClass, FormSection, inputClass, labelClass } from "@/components/form-ui";
import { SortableImagePicker } from "@/components/sortable-image-picker";
import { fieldClass, type WizardState } from "./wizard-types";

type Step4Props = {
  wizard: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  photos: File[];
  onPhotosChange: (files: File[]) => void;
  errors: Record<string, string>;
};

export function Step4PhotosDescription({ wizard, onChange, photos, onPhotosChange, errors }: Step4Props) {
  return (
    <div className="space-y-6">
      <FormSection
        title="Fotoğraflar"
        description="Aracınızın fotoğraflarını ekleyin; sıralamayı değiştirmek için sürükleyin."
      >
        <SortableImagePicker files={photos} onFilesChange={onPhotosChange} />
      </FormSection>

      <FormSection title="İlan Başlığı ve Açıklama">
        <div>
          <label htmlFor="title" className={labelClass}>
            İlan Başlığı <span className="font-normal text-slate-400">(opsiyonel)</span>
          </label>
          <input
            id="title"
            type="text"
            value={wizard.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Boş bırakılırsa otomatik oluşturulur"
            className={fieldClass(inputClass, errors.title)}
          />
          {errors.title && <p className={errorClass}>{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            İlan Açıklaması <span className="font-normal text-slate-400">(opsiyonel)</span>
          </label>
          <textarea
            id="description"
            rows={6}
            value={wizard.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Aracınız hakkında alıcılara aktarmak istediğiniz detayları yazın..."
            className={inputClass}
          />
        </div>
      </FormSection>
    </div>
  );
}
