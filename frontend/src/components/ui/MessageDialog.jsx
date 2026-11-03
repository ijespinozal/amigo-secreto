import { useId } from "react";
import Button from "./Button";
import Modal from "./Modal";

/**
 * Ventana de mensaje / confirmación con el estilo de la app: ícono grande,
 * título festivo, explicación y botones.
 *
 * @param {string}    [icon]          emoji principal
 * @param {ReactNode} title
 * @param {ReactNode} [message]
 * @param {string}    confirmLabel
 * @param {string}    [cancelLabel]   si se omite, solo hay un botón (modo aviso)
 * @param {"primary"|"danger"} [tone] color del botón principal
 * @param {boolean}   [loading]
 */
export default function MessageDialog({
  open,
  icon = "🔔",
  title,
  message,
  confirmLabel = "Aceptar",
  cancelLabel,
  tone = "primary",
  loading = false,
  onConfirm,
  onCancel,
}) {
  const titleId = useId();
  // Sin "cancelar", cerrar con Escape o clic afuera equivale a aceptar el aviso.
  const dismiss = loading ? undefined : (onCancel ?? onConfirm);

  return (
    <Modal open={open} onClose={dismiss} labelledBy={titleId} className="max-w-sm p-6 sm:p-7 text-center">
      <div aria-hidden="true" className="text-5xl mb-3 select-none">{icon}</div>
      <h3 id={titleId} className="font-festive font-bold text-xl sm:text-2xl text-pine-700 leading-snug">
        {title}
      </h3>
      {message && <div className="mt-2 text-sm font-semibold text-ink-soft leading-relaxed">{message}</div>}

      <div className="flex gap-3 mt-6">
        <Button
          variant={tone === "danger" ? "danger" : "primary"}
          size="md"
          block
          disabled={loading}
          onClick={onConfirm}
          className="rounded-xl py-3"
        >
          {loading ? "Procesando..." : confirmLabel}
        </Button>
        {cancelLabel && (
          <Button
            variant="neutral"
            size="md"
            block
            disabled={loading}
            onClick={onCancel}
            className="rounded-xl py-3"
          >
            {cancelLabel}
          </Button>
        )}
      </div>
    </Modal>
  );
}
