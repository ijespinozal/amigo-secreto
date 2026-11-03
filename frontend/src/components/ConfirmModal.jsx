import MessageDialog from "./ui/MessageDialog";

/**
 * Confirmación de una acción (con estado de carga mientras se ejecuta).
 * @param {string}    message       pregunta principal
 * @param {ReactNode} [details]     explicación de las consecuencias
 * @param {"danger"|"primary"} [tone] rojo para acciones destructivas, verde para las demás
 */
export default function ConfirmModal({
  open,
  message,
  details,
  icon = "🔔",
  confirmLabel = "Sí, eliminar",
  cancelLabel = "Cancelar",
  tone = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <MessageDialog
      open={open}
      icon={icon}
      title={message}
      message={details}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      tone={tone}
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
