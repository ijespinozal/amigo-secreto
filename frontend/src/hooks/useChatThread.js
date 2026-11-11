import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api";

const POLL_INTERVAL_MS = 8000;

/**
 * Una conversación del chat secreto ("friend" o "santa"), actualizada cada
 * pocos segundos mientras la pestaña está visible (no hay tiempo real: así
 * funciona en el plan gratuito sin conexiones abiertas).
 *
 * @param {"friend"|"santa"} thread
 * @param {*} scope contexto (evento seleccionado): al cambiar se recarga
 * @param {() => void} [onPoll] se llama en cada actualización (p. ej. avisos de no leídos)
 * @returns {{ messages: Array|null, error, send: (body: string) => Promise<void> }}
 */
export default function useChatThread(thread, scope, onPoll) {
  const key = `${scope}:${thread}`;
  const [state, setState] = useState({ key: null, messages: null, error: null });
  // Cada envío invalida las lecturas que ya estaban en curso: una respuesta
  // "vieja" no debe borrar de la pantalla el mensaje recién enviado.
  const generation = useRef(0);
  const onPollRef = useRef(onPoll);
  useEffect(() => {
    onPollRef.current = onPoll;
  });

  useEffect(() => {
    // `active` descarta respuestas que lleguen después de cambiar de conversación.
    let active = true;
    const fetchMessages = async () => {
      const startedAt = generation.current;
      const isCurrent = () => active && generation.current === startedAt;
      try {
        const res = await api.get(`/user/chats/${thread}`);
        if (isCurrent()) setState({ key, messages: res.data.messages, error: null });
      } catch (error) {
        if (isCurrent()) setState((prev) => ({ key, messages: prev.key === key ? prev.messages : null, error }));
      }
    };
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      fetchMessages();
      onPollRef.current?.();
    };
    tick();
    const id = setInterval(tick, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      active = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [thread, key]);

  const send = useCallback(
    async (body) => {
      const res = await api.post(`/user/chats/${thread}`, { body });
      generation.current++;
      setState((prev) => ({ key, error: null, messages: [...(prev.key === key ? prev.messages ?? [] : []), res.data.message] }));
    },
    [thread, key]
  );

  const current = state.key === key;
  return { messages: current ? state.messages : null, error: current ? state.error : null, send };
}
