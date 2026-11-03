import { useEffect, useState } from "react";
import { parseCalendarDate } from "../utils/date";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Cuenta regresiva hasta el inicio (00:00, hora local) de una fecha "YYYY-MM-DD".
 * Se actualiza cada segundo.
 * @returns {{ days, hours, minutes, seconds, reached: boolean } | null} null si no hay fecha
 */
export default function useCountdown(dateValue) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!dateValue) return;
    const id = setInterval(() => setNow(Date.now()), SECOND);
    return () => clearInterval(id);
  }, [dateValue]);

  const target = parseCalendarDate(dateValue);
  if (!target) return null;

  const diff = target.getTime() - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, reached: true };

  return {
    days: Math.floor(diff / DAY),
    hours: Math.floor((diff % DAY) / HOUR),
    minutes: Math.floor((diff % HOUR) / MINUTE),
    seconds: Math.floor((diff % MINUTE) / SECOND),
    reached: false,
  };
}
