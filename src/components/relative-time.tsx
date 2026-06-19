"use client";

import { useEffect, useState } from "react";
import { formatFullDateTime, formatRelativeTime, formatTime } from "@/lib/format";

const REFRESH_INTERVAL_MS = 45_000;

type RelativeTimeProps = {
  date: Date | string;
  className?: string;
  /** Göreli zamanın yanında "· 14:32" şeklinde tam saat de gösterilsin mi. */
  showTime?: boolean;
};

// Sayfa açık kaldıkça "x dakika önce" etiketini periyodik olarak yeniden
// hesaplar; tam tarih/saat hover tooltip'inde ("title") gösterilir.
export function RelativeTime({ date, className, showTime }: RelativeTimeProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const target = new Date(date);

  return (
    <time dateTime={target.toISOString()} title={formatFullDateTime(target)} className={className}>
      {formatRelativeTime(target, now)}
      {showTime && <> · {formatTime(target)}</>}
    </time>
  );
}
