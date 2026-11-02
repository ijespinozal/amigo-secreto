import { useCallback, useEffect, useState } from "react";
import api from "../api";

/**
 * GET a la API con estados de carga/error y recarga manual.
 *
 * @param {string} path      ruta relativa a VITE_URL_SERVER
 * @param {object} [options]
 * @param {boolean} [options.enabled=true]  false = no pedir (p. ej. sin evento)
 * @param {*}       [options.scope]         contexto implícito de la petición
 *   (p. ej. el evento enviado en X-Event-Id): al cambiar, se vuelve a pedir y
 *   no se muestran datos del contexto anterior.
 * @returns {{ data, error, loading, reload, setData }}
 *   Durante un `reload` se conservan los datos actuales (sin parpadeo).
 */
export default function useApiData(path, { enabled = true, scope } = {}) {
  const scopeKey = JSON.stringify([path, scope ?? null]);
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ scopeKey: null, requestKey: null, data: undefined, error: null });

  const requestKey = enabled ? `${scopeKey}#${reloadCount}` : null;

  useEffect(() => {
    if (!requestKey) return;

    let cancelled = false;
    const fetchData = async () => {
      try {
        const res = await api.get(path);
        if (!cancelled) setResult({ scopeKey, requestKey, data: res.data, error: null });
      } catch (error) {
        if (!cancelled) setResult({ scopeKey, requestKey, data: undefined, error });
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [path, scopeKey, requestKey]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  const setData = useCallback(
    (updater) =>
      setResult((prev) => ({
        ...prev,
        data: typeof updater === "function" ? updater(prev.data) : updater,
      })),
    []
  );

  const sameScope = enabled && result.scopeKey === scopeKey;
  return {
    data: sameScope ? result.data : undefined,
    error: sameScope ? result.error : null,
    loading: enabled && result.requestKey !== requestKey,
    reload,
    setData,
  };
}
