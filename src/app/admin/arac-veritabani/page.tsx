import { prisma } from "@/lib/prisma";
import { ConfirmActionButton, ToastForm } from "@/components/admin/action-button";
import { PageHeader } from "@/components/admin/page-header";
import { SummaryActions } from "@/components/admin/summary-actions";
import { inputClass, labelClass, selectClass } from "@/components/form-ui";
import { CheckIcon, GaugeIcon, PlusIcon, TagIcon, TrashIcon } from "@/components/icons";
import { DRIVETRAINS, FUEL_TYPES, TRANSMISSIONS } from "@/lib/car-data";
import {
  createBrandAction,
  createGenerationAction,
  createModelAction,
  createTrimAction,
  deleteBrandAction,
  deleteGenerationAction,
  deleteModelAction,
  deleteTrimAction,
  updateBrandAction,
  updateGenerationAction,
  updateModelAction,
  updateTrimAction,
} from "./actions";

const saveBtn =
  "inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60";
const addFormClass =
  "animate-fade-in-up mt-2 flex flex-wrap items-end gap-2 rounded-lg bg-slate-50 p-3";
const editFormClass = addFormClass;
const smallInput = `${inputClass} w-36`;
const smallSelect = `${selectClass} w-36`;

export default async function AracVeritabaniPage() {
  // Tek iç içe sorgu (include zinciri), her seviyenin TÜM id'lerini bir
  // WHERE...IN cümlesinde bağlar; autoevolution içe aktarımından sonra
  // (binlerce jenerasyon/donanım) SQLite'ın bağlı parametre limitini
  // aşıp P2029 hatası veriyordu (bkz. src/lib/vehicle-catalog.ts).
  // Dört tabloyu WHERE'siz çekip ağacı JS'te kuruyoruz.
  const [brandRows, modelRows, generationRows, trimRows] = await Promise.all([
    prisma.vehicleBrand.findMany({ orderBy: { order: "asc" } }),
    prisma.vehicleModel.findMany({ orderBy: { order: "asc" } }),
    prisma.vehicleGeneration.findMany({ orderBy: { order: "asc" } }),
    prisma.vehicleTrim.findMany({ orderBy: { order: "asc" } }),
  ]);

  type GenerationWithTrims = (typeof generationRows)[number] & { trims: typeof trimRows };
  type ModelWithGenerations = (typeof modelRows)[number] & { generations: GenerationWithTrims[] };

  const trimsByGeneration = new Map<string, typeof trimRows>();
  for (const t of trimRows) {
    const list = trimsByGeneration.get(t.generationId);
    if (list) list.push(t);
    else trimsByGeneration.set(t.generationId, [t]);
  }
  const generationsByModel = new Map<string, GenerationWithTrims[]>();
  for (const g of generationRows) {
    const entry: GenerationWithTrims = { ...g, trims: trimsByGeneration.get(g.id) ?? [] };
    const list = generationsByModel.get(g.modelId);
    if (list) list.push(entry);
    else generationsByModel.set(g.modelId, [entry]);
  }
  const modelsByBrand = new Map<string, ModelWithGenerations[]>();
  for (const m of modelRows) {
    const entry: ModelWithGenerations = { ...m, generations: generationsByModel.get(m.id) ?? [] };
    const list = modelsByBrand.get(m.brandId);
    if (list) list.push(entry);
    else modelsByBrand.set(m.brandId, [entry]);
  }
  const brands = brandRows.map((b) => ({ ...b, models: modelsByBrand.get(b.id) ?? [] }));

  return (
    <div className="space-y-8">
      <PageHeader
        icon={GaugeIcon}
        title="Araç Veritabanı"
        description="İlan sihirbazında kademeli seçim için marka/model/jenerasyon/donanım kataloğunu düzenleyin."
        accent="red"
      />

      {/* Yeni Marka */}
      <div className="rounded-xl bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-base font-semibold text-foreground">Yeni Marka Ekle</h2>
        <ToastForm
          action={createBrandAction}
          successMessage="Marka eklendi."
          errorMessage="Marka eklenemedi."
          className="flex flex-wrap items-end gap-2"
        >
          <div>
            <label htmlFor="new-brand-name" className={labelClass}>
              Marka Adı
            </label>
            <input
              id="new-brand-name"
              name="name"
              required
              placeholder="örn: Volkswagen"
              className={smallInput}
            />
          </div>
          <button type="submit" className={saveBtn}>
            <PlusIcon className="h-3.5 w-3.5" />
            Ekle
          </button>
        </ToastForm>
      </div>

      {/* Marka listesi */}
      {brands.map((brand) => (
        <div key={brand.id} className="rounded-xl bg-white shadow-soft">
          {/* Marka başlığı */}
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <GaugeIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold text-foreground">{brand.name}</p>
                <p className="text-xs text-slate-400">
                  {brand.models.length} model ·{" "}
                  {brand.models.reduce((s, m) => s + m.generations.length, 0)} jenerasyon ·{" "}
                  {brand.models.reduce(
                    (s, m) => s + m.generations.reduce((gs, g) => gs + g.trims.length, 0),
                    0,
                  )}{" "}
                  donanım
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <details className="group">
                <summary className="cursor-pointer list-none rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                  Düzenle
                </summary>
                <ToastForm
                  action={updateBrandAction.bind(null, brand.id)}
                  successMessage="Marka güncellendi."
                  errorMessage="Marka güncellenemedi."
                  className={editFormClass}
                >
                  <div>
                    <label className={labelClass}>Ad</label>
                    <input name="name" defaultValue={brand.name} required className={smallInput} />
                  </div>
                  <button type="submit" className={saveBtn}>
                    <CheckIcon className="h-3.5 w-3.5" />
                    Kaydet
                  </button>
                </ToastForm>
              </details>
              <ConfirmActionButton
                action={deleteBrandAction.bind(null, brand.id)}
                confirmTitle="Markayı Sil"
                confirmMessage={`"${brand.name}" markasını ve tüm altındaki modelleri, jenerasyonları ve donanımları silmek istediğinizden emin misiniz?`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <TrashIcon className="h-3.5 w-3.5" />
                Sil
              </ConfirmActionButton>
            </div>
          </div>

          {/* Marka içeriği: model listesi + yeni model formu */}
          <div className="p-5 space-y-4">
            {/* Yeni model formu */}
            <details className="group">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                <PlusIcon className="h-3.5 w-3.5" />
                Yeni Model Ekle
              </summary>
              <ToastForm
                action={createModelAction.bind(null, brand.id)}
                successMessage="Model eklendi."
                errorMessage="Model eklenemedi."
                className={addFormClass}
              >
                <div>
                  <label className={labelClass}>Model Adı</label>
                  <input name="name" required placeholder="örn: Golf" className={smallInput} />
                </div>
                <button type="submit" className={saveBtn}>
                  <PlusIcon className="h-3.5 w-3.5" />
                  Ekle
                </button>
              </ToastForm>
            </details>

            {/* Model listesi */}
            {brand.models.map((model) => (
              <details key={model.id} className="group rounded-lg border border-slate-200">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-2">
                    <TagIcon className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-foreground">{model.name}</span>
                    <span className="text-xs text-slate-400">
                      {model.generations.length} jenerasyon ·{" "}
                      {model.generations.reduce((s, g) => s + g.trims.length, 0)} donanım
                    </span>
                  </div>
                  <SummaryActions className="flex shrink-0 items-center gap-2">
                    <details className="group/edit">
                      <summary className="cursor-pointer list-none rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                        Düzenle
                      </summary>
                      <ToastForm
                        action={updateModelAction.bind(null, model.id)}
                        successMessage="Model güncellendi."
                        errorMessage="Model güncellenemedi."
                        className={editFormClass}
                      >
                        <div>
                          <label className={labelClass}>Ad</label>
                          <input name="name" defaultValue={model.name} required className={smallInput} />
                        </div>
                        <button type="submit" className={saveBtn}>
                          <CheckIcon className="h-3.5 w-3.5" />
                          Kaydet
                        </button>
                      </ToastForm>
                    </details>
                    <ConfirmActionButton
                      action={deleteModelAction.bind(null, model.id)}
                      confirmTitle="Modeli Sil"
                      confirmMessage={`"${model.name}" modelini ve tüm altındaki jenerasyonları ve donanımları silmek istediğinizden emin misiniz?`}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      <TrashIcon className="h-3 w-3" />
                      Sil
                    </ConfirmActionButton>
                  </SummaryActions>
                </summary>

                <div className="border-t border-slate-100 p-4 space-y-4">
                  {/* Yeni jenerasyon formu */}
                  <details className="group">
                    <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                      <PlusIcon className="h-3.5 w-3.5" />
                      Yeni Jenerasyon Ekle
                    </summary>
                    <ToastForm
                      action={createGenerationAction.bind(null, model.id)}
                      successMessage="Jenerasyon eklendi."
                      errorMessage="Jenerasyon eklenemedi."
                      className={addFormClass}
                    >
                      <div>
                        <label className={labelClass}>Ad</label>
                        <input name="name" required placeholder="örn: Golf 7" className={smallInput} />
                      </div>
                      <div>
                        <label className={labelClass}>Başlangıç Yılı</label>
                        <input name="yearStart" type="number" required placeholder="2012" className={`${inputClass} w-24`} />
                      </div>
                      <div>
                        <label className={labelClass}>Bitiş Yılı</label>
                        <input name="yearEnd" type="number" placeholder="günümüz" className={`${inputClass} w-24`} />
                      </div>
                      <button type="submit" className={saveBtn}>
                        <PlusIcon className="h-3.5 w-3.5" />
                        Ekle
                      </button>
                    </ToastForm>
                  </details>

                  {/* Jenerasyon listesi */}
                  {model.generations.map((gen) => (
                    <details key={gen.id} className="group rounded-lg border border-slate-100 bg-slate-50/50">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 [&::-webkit-details-marker]:hidden">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-foreground">{gen.name}</span>
                          <span className="text-xs text-slate-400">
                            {gen.yearStart}–{gen.yearEnd ?? "günümüz"} · {gen.trims.length} donanım
                          </span>
                        </div>
                        <SummaryActions className="flex shrink-0 items-center gap-2">
                          <details className="group/edit">
                            <summary className="cursor-pointer list-none rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                              Düzenle
                            </summary>
                            <ToastForm
                              action={updateGenerationAction.bind(null, gen.id)}
                              successMessage="Jenerasyon güncellendi."
                              errorMessage="Jenerasyon güncellenemedi."
                              className={editFormClass}
                            >
                              <div>
                                <label className={labelClass}>Ad</label>
                                <input name="name" defaultValue={gen.name} required className={smallInput} />
                              </div>
                              <div>
                                <label className={labelClass}>Başlangıç</label>
                                <input name="yearStart" type="number" defaultValue={gen.yearStart} required className={`${inputClass} w-24`} />
                              </div>
                              <div>
                                <label className={labelClass}>Bitiş</label>
                                <input name="yearEnd" type="number" defaultValue={gen.yearEnd ?? ""} placeholder="günümüz" className={`${inputClass} w-24`} />
                              </div>
                              <button type="submit" className={saveBtn}>
                                <CheckIcon className="h-3.5 w-3.5" />
                                Kaydet
                              </button>
                            </ToastForm>
                          </details>
                          <ConfirmActionButton
                            action={deleteGenerationAction.bind(null, gen.id)}
                            confirmTitle="Jenerasyonu Sil"
                            confirmMessage={`"${gen.name}" jenerasyonunu ve tüm donanımlarını silmek istediğinizden emin misiniz?`}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                          >
                            <TrashIcon className="h-3 w-3" />
                            Sil
                          </ConfirmActionButton>
                        </SummaryActions>
                      </summary>

                      <div className="border-t border-slate-100 p-3 space-y-3">
                        {/* Yeni donanım formu */}
                        <details>
                          <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                            <PlusIcon className="h-3 w-3" />
                            Yeni Donanım/Motor Ekle
                          </summary>
                          <ToastForm
                            action={createTrimAction.bind(null, gen.id)}
                            successMessage="Donanım eklendi."
                            errorMessage="Donanım eklenemedi."
                            className={addFormClass}
                          >
                            <div>
                              <label className={labelClass}>Ad (Tam Etiket)</label>
                              <input name="name" required placeholder="1.5 TSI Life" className={smallInput} />
                            </div>
                            <div>
                              <label className={labelClass}>Donanım Paketi</label>
                              <input name="equipmentPackage" placeholder="Life" className={smallInput} />
                            </div>
                            <div>
                              <label className={labelClass}>Yakıt</label>
                              <select name="fuelType" required className={smallSelect}>
                                <option value="">Seçin</option>
                                {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className={labelClass}>Vites</label>
                              <select name="transmission" required className={smallSelect}>
                                <option value="">Seçin</option>
                                {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className={labelClass}>Motor Hacmi</label>
                              <input name="engineVolume" placeholder="1.5" className={`${inputClass} w-20`} />
                            </div>
                            <div>
                              <label className={labelClass}>Motor Gücü</label>
                              <input name="enginePower" placeholder="130 hp" className={`${inputClass} w-24`} />
                            </div>
                            <div>
                              <label className={labelClass}>Çekiş</label>
                              <select name="drivetrain" className={smallSelect}>
                                <option value="">Seçin</option>
                                {DRIVETRAINS.map((d) => <option key={d} value={d}>{d}</option>)}
                              </select>
                            </div>
                            <button type="submit" className={saveBtn}>
                              <PlusIcon className="h-3.5 w-3.5" />
                              Ekle
                            </button>
                          </ToastForm>
                        </details>

                        {/* Donanım listesi */}
                        {gen.trims.map((trim) => (
                          <div
                            key={trim.id}
                            className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-white p-3 sm:flex-row sm:items-start sm:justify-between"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground">{trim.name}</p>
                              <p className="text-xs text-slate-400">
                                {trim.fuelType} · {trim.transmission}
                                {trim.engineVolume ? ` · ${trim.engineVolume}L` : ""}
                                {trim.enginePower ? ` · ${trim.enginePower}` : ""}
                                {trim.drivetrain ? ` · ${trim.drivetrain}` : ""}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <details>
                                <summary className="cursor-pointer list-none rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                                  Düzenle
                                </summary>
                                <ToastForm
                                  action={updateTrimAction.bind(null, trim.id)}
                                  successMessage="Donanım güncellendi."
                                  errorMessage="Donanım güncellenemedi."
                                  className={editFormClass}
                                >
                                  <div>
                                    <label className={labelClass}>Ad</label>
                                    <input name="name" defaultValue={trim.name} required className={smallInput} />
                                  </div>
                                  <div>
                                    <label className={labelClass}>Donanım Paketi</label>
                                    <input name="equipmentPackage" defaultValue={trim.equipmentPackage ?? ""} className={smallInput} />
                                  </div>
                                  <div>
                                    <label className={labelClass}>Yakıt</label>
                                    <select name="fuelType" defaultValue={trim.fuelType} required className={smallSelect}>
                                      {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                  </div>
                                  <div>
                                    <label className={labelClass}>Vites</label>
                                    <select name="transmission" defaultValue={trim.transmission} required className={smallSelect}>
                                      {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                  </div>
                                  <div>
                                    <label className={labelClass}>Motor Hacmi</label>
                                    <input name="engineVolume" defaultValue={trim.engineVolume ?? ""} className={`${inputClass} w-20`} />
                                  </div>
                                  <div>
                                    <label className={labelClass}>Motor Gücü</label>
                                    <input name="enginePower" defaultValue={trim.enginePower ?? ""} className={`${inputClass} w-24`} />
                                  </div>
                                  <div>
                                    <label className={labelClass}>Çekiş</label>
                                    <select name="drivetrain" defaultValue={trim.drivetrain ?? ""} className={smallSelect}>
                                      <option value="">Seçin</option>
                                      {DRIVETRAINS.map((d) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                  </div>
                                  <button type="submit" className={saveBtn}>
                                    <CheckIcon className="h-3.5 w-3.5" />
                                    Kaydet
                                  </button>
                                </ToastForm>
                              </details>
                              <ConfirmActionButton
                                action={deleteTrimAction.bind(null, trim.id)}
                                confirmTitle="Donanımı Sil"
                                confirmMessage={`"${trim.name}" donanımını silmek istediğinizden emin misiniz?`}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                              >
                                <TrashIcon className="h-3 w-3" />
                                Sil
                              </ConfirmActionButton>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      ))}

      {brands.length === 0 && (
        <div className="rounded-xl bg-white p-8 text-center shadow-soft">
          <p className="text-sm text-slate-500">
            Henüz araç kataloğu oluşturulmamış. Yeni marka ekleyerek başlayın.
          </p>
        </div>
      )}
    </div>
  );
}
