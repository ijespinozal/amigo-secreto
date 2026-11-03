import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

  // Refs con los últimos valores, para las cargas asíncronas.
  const userIdRef = useRef(userId);
  const stateRef = useRef(state);
  useEffect(() => {
    userIdRef.current = userId;
    stateRef.current = state;
  });

  /** Aplica una lista de eventos conservando la selección si sigue siendo válida. */
  const applyEvents = useCallback((forUserId, events) => {
    const current = stateRef.current.userId === forUserId ? stateRef.current.selectedEventId : null;
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    const selectedEventId =
      [current, stored].map((id) => events.find((e) => e.id === id)?.id).find(Boolean) ?? events[0]?.id ?? null;

    setActiveEventId(selectedEventId);
    setState({ userId: forUserId, events, selectedEventId, error: null });
  }, []);

  // Carga inicial (y al cambiar de usuario).
  useEffect(() => {
    if (!userId) {
      setActiveEventId(null);
      return;
    }

    let cancelled = false;
    const loadEvents = async () => {
      try {
        const res = await api.get("/user/events");
        if (!cancelled) applyEvents(userId, res.data.events);
      } catch (error) {
        if (!cancelled) setState({ userId, events: [], selectedEventId: null, error });
      }
    };

    loadEvents();
    return () => {
      cancelled = true;
    };
  }, [userId, applyEvents]);

  const selectEvent = useCallback((eventId) => {
    setActiveEventId(eventId);
    localStorage.setItem(STORAGE_KEY, String(eventId));
    setState((prev) => ({ ...prev, selectedEventId: eventId }));
  }, []);

  /**
   * Vuelve a pedir los eventos al servidor.
   * @returns {Promise<Array>} los eventos frescos (para decidir sin esperar un render)
   */
  const reload = useCallback(async () => {
    const forUserId = userIdRef.current;
    if (!forUserId) return [];
    try {
      const res = await api.get("/user/events");
      if (userIdRef.current === forUserId) applyEvents(forUserId, res.data.events);
      return res.data.events;
    } catch (error) {
      if (userIdRef.current === forUserId) setState({ userId: forUserId, events: [], selectedEventId: null, error });
      throw error;
    }
  }, [applyEvents]);

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
