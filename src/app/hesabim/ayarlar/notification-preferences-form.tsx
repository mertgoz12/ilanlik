"use client";

import { ToastForm } from "@/components/admin/action-button";
import { FormSection } from "@/components/form-ui";
import { BellIcon } from "@/components/icons";
import { updateNotificationPreferencesAction } from "./actions";

type NotificationPreferencesFormProps = {
  notifyNewMessage: boolean;
  notifySavedSearch: boolean;
  notifyListingUpdates: boolean;
};

const PREFERENCES: {
  name: keyof NotificationPreferencesFormProps;
  label: string;
  description: string;
}[] = [
  {
    name: "notifyNewMessage",
    label: "Yeni mesaj bildirimleri",
    description: "Size mesaj gönderildiğinde bildirim alın.",
  },
  {
    name: "notifySavedSearch",
    label: "Kayıtlı arama bildirimleri",
    description: "Kayıtlı aramalarınıza uygun yeni ilan eklendiğinde bildirim alın.",
  },
  {
    name: "notifyListingUpdates",
    label: "İlan güncellemeleri",
    description: "İlanlarınızla ilgili durum değişikliklerinde (yayına alma, inceleme vb.) bildirim alın.",
  },
];

export function NotificationPreferencesForm(props: NotificationPreferencesFormProps) {
  return (
    <ToastForm action={updateNotificationPreferencesAction} successMessage="Bildirim tercihleriniz kaydedildi.">
      <FormSection
        title="Bildirim Tercihleri"
        description="Hangi durumlarda bildirim almak istediğinizi seçin."
        icon={BellIcon}
        accent="amber"
      >
        <div className="space-y-3">
          {PREFERENCES.map((pref) => (
            <label
              key={pref.name}
              className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50"
            >
              <input
                type="checkbox"
                name={pref.name}
                defaultChecked={props[pref.name]}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand focus:ring-accent"
              />
              <span>
                <span className="block text-sm font-medium text-foreground">{pref.label}</span>
                <span className="block text-xs text-slate-400">{pref.description}</span>
              </span>
            </label>
          ))}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-brand shadow-sm transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            Kaydet
          </button>
        </div>
      </FormSection>
    </ToastForm>
  );
}
