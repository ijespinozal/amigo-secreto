/**
 * Confirmación genérica.
 * @param {string}    message       pregunta principal
 * @param {ReactNode} [details]     explicación de las consecuencias
 * @param {string}    [confirmLabel]
 * @param {boolean}   [loading]     deshabilita los botones mientras se ejecuta la acción
 * @param {"danger"|"primary"} [tone] rojo para acciones destructivas, verde para las demás
 */
export default function ConfirmModal({
  open,
  message,
  details,
  confirmLabel = "Sí, eliminar",
  cancelLabel = "Cancelar",
  tone = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white/95 rounded-2xl shadow-xl p-6 w-[90%] max-w-sm animate-fadeInUp border border-red-200">

        <div className="text-center text-5xl mb-3">🔔</div>
        <h3 className="text-xl font-bold text-center text-green-700 mb-2">
          {message}
        </h3>

        {details && (
          <div className="text-sm text-gray-600 text-center mb-2">{details}</div>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2 rounded-lg text-white font-semibold shadow-md disabled:opacity-60 ${
              tone === "primary" ? "!bg-green-700 hover:!bg-green-800" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Procesando..." : confirmLabel}
          </button>

          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2 rounded-lg !bg-gray-500 hover:!bg-gray-600 text-white font-semibold disabled:opacity-60"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
