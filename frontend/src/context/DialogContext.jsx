import { useCallback, useMemo, useRef, useState } from "react";
import MessageDialog from "../components/ui/MessageDialog";
import { DialogContext } from "./contexts";

const PRESETS = {
  success: { icon: "🎉", title: "¡Listo!" },
  error: { icon: "⚠️", title: "No se pudo completar" },
  info: { icon: "🔔", title: "Aviso" },
};

/**
 * Servicio de diálogos con el estilo de la app (reemplaza window.alert/confirm).
 *   await dialog.alert({ type: "error", message: "..." })
 *   if (await dialog.confirm({ title: "¿Seguro?", message: "...", tone: "danger" })) { ... }
 * Los diálogos se encolan: si llegan dos seguidos, se muestran uno tras otro.
 */
export function DialogProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const idRef = useRef(0);

  const open = useCallback(
    (kind, options) =>
      new Promise((resolve) => {
        idRef.current += 1;
        setQueue((prev) => [...prev, { id: idRef.current, kind, options, resolve }]);
      }),
    []
  );

  const close = (result) => {
    queue[0]?.resolve(result);
    setQueue((prev) => prev.slice(1));
  };

  const api = useMemo(
    () => ({
      /** @param {{ type?: "success"|"error"|"info", title?, message?, icon?, confirmLabel? }} options */
      alert: (options) => open("alert", options),
      /** @param {{ title, message?, icon?, confirmLabel?, cancelLabel?, tone?: "primary"|"danger" }} options @returns {Promise<boolean>} */
      confirm: (options) => open("confirm", options),
    }),
    [open]
  );

  const current = queue[0];
  const preset = PRESETS[current?.options.type ?? "info"];

  return (
    <DialogContext.Provider value={api}>
      {children}
      {current && (
        <MessageDialog
          key={current.id}
          open
          icon={current.options.icon ?? preset.icon}
          title={current.options.title ?? preset.title}
          message={current.options.message}
          confirmLabel={current.options.confirmLabel ?? (current.kind === "confirm" ? "Aceptar" : "Entendido")}
          cancelLabel={current.kind === "confirm" ? current.options.cancelLabel ?? "Cancelar" : undefined}
          tone={current.options.tone ?? "primary"}
          onConfirm={() => close(true)}
          onCancel={current.kind === "confirm" ? () => close(false) : undefined}
        />
      )}
    </DialogContext.Provider>
  );
}
