import { useEffect, useState } from "react";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Cuenta regresiva hasta un instante. Se actualiza cada segundo.
 * @param {Date|null} target p. ej. eventStart(event): fecha + hora local
 * @returns {{ days, hours, minutes, seconds, reached: boolean } | null} null si no hay destino
 */
export default function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now());
  const targetMs = target?.getTime() ?? null;

  useEffect(() => {
    if (targetMs === null) return;
    const id = setInterval(() => setNow(Date.now()), SECOND);
    return () => clearInterval(id);
  }, [targetMs]);

  if (targetMs === null) return null;

  const diff = targetMs - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, reached: true };

  return {
    days: Math.floor(diff / DAY),
    hours: Math.floor((diff % DAY) / HOUR),
    minutes: Math.floor((diff % HOUR) / MINUTE),
    seconds: Math.floor((diff % MINUTE) / SECOND),
    reached: false,
  };
}
