import { useCallback, useEffect, useMemo, useState } from "react";
import api, { setActiveEventId } from "../api";
import useAuth from "../hooks/useAuth";
import { EventContext } from "./contexts";

const STORAGE_KEY = "selectedEventId";

/**
 * Eventos del usuario participante y el evento seleccionado.
 * - Con un solo evento se usa ese, sin pedir nada al usuario.
 * - Con varios, se recuerda la elección; por defecto, el más reciente.
 * El evento seleccionado viaja al backend en la cabecera X-Event-Id (api.js).
 */
export function EventProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.role === "user" ? user.id : null;

  // Se guarda para qué usuario se cargó: así "cargando" se deriva sin
  // reiniciar estado de forma síncrona dentro del efecto.
  const [state, setState] = useState({ userId: null, events: [], selectedEventId: null, error: null });
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setActiveEventId(null);
      return;
    }

    let cancelled = false;
    const loadEvents = async () => {
      try {
        const res = await api.get("/user/events");
        if (cancelled) return;

        const events = res.data.events;
        const stored = Number(localStorage.getItem(STORAGE_KEY));
        const selectedEventId = events.find((e) => e.id === stored)?.id ?? events[0]?.id ?? null;

        setActiveEventId(selectedEventId);
        setState({ userId, events, selectedEventId, error: null });
      } catch (error) {
        if (!cancelled) setState({ userId, events: [], selectedEventId: null, error });
      }
    };

    loadEvents();
    return () => {
      cancelled = true;
    };
  }, [userId, reloadCount]);

  const selectEvent = useCallback((eventId) => {
    setActiveEventId(eventId);
    localStorage.setItem(STORAGE_KEY, String(eventId));
    setState((prev) => ({ ...prev, selectedEventId: eventId }));
  }, []);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  const value = useMemo(() => {
    const ready = userId !== null && state.userId === userId;
    const events = ready ? state.events : [];
    const selectedEventId = ready ? state.selectedEventId : null;
    return {
      ready,
      error: ready ? state.error : null,
      events,
      selectedEventId,
      selectedEvent: events.find((e) => e.id === selectedEventId) ?? null,
      hasMultipleEvents: events.length > 1,
      selectEvent,
      reload,
    };
  }, [userId, state, selectEvent, reload]);

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}
