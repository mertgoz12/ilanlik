import { EQUIPMENT_GROUPS } from "@/lib/car-data";
import { CheckIcon } from "./icons";

export function EquipmentGrid({ selected }: { selected: string[] }) {
  const ownedSet = new Set(selected);
  const groups = EQUIPMENT_GROUPS.map((group) => ({
    title: group.title,
    items: group.items.filter((item) => ownedSet.has(item.key)),
  })).filter((group) => group.items.length > 0);

  if (groups.length === 0) {
    return <p className="text-sm text-slate-500">Donanım bilgisi girilmemiş.</p>;
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.title}>
          <h3 className="mb-3 text-sm font-semibold text-foreground">{group.title}</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {group.items.map((item) => (
              <div key={item.key} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground">
                <CheckIcon className="h-4 w-4 shrink-0 text-emerald-600" />
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
