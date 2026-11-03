import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { NO_EVENT_DIALOG } from "../config/messages";
import useDialog from "./useDialog";
import useEvents from "./useEvents";

/**
 * Protege las pantallas que necesitan un evento (mis regalos, regalos del
 * grupo, amigo secreto): si el usuario no pertenece a ninguno, vuelve al
 * inicio con el aviso en vez de mostrar una pantalla vacía.
 * @returns {boolean} true mientras redirige (la página debe mostrar "cargando")
 */
export default function useRequireEvent() {
  const { ready, selectedEventId, error } = useEvents();
  const navigate = useNavigate();
  const dialog = useDialog();
  // Evita el aviso duplicado del doble montaje de StrictMode en desarrollo.
  const redirectedRef = useRef(false);

  const missing = ready && !error && selectedEventId === null;

  useEffect(() => {
    if (!missing || redirectedRef.current) return;
    redirectedRef.current = true;
    navigate("/user/home", { replace: true });
    dialog.alert(NO_EVENT_DIALOG);
  }, [missing, navigate, dialog]);

  return missing;
}
