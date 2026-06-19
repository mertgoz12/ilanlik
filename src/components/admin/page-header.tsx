import type { ComponentType, ReactNode } from "react";
import { ACCENT_ICON_STYLES, type Accent } from "./accent";

type PageHeaderProps = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
  accent?: Accent;
};

export function PageHeader({ icon: Icon, title, description, action, accent = "emerald" }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3.5">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ACCENT_ICON_STYLES[accent]}`}>
          <Icon className="h-5.5 w-5.5" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
