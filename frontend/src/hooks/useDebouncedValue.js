import { useEffect, useState } from "react";

/** Devuelve `value` cuando deja de cambiar durante `delay` ms (búsquedas mientras se escribe). */
export default function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
