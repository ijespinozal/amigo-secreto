export default function ConfirmModal({ open, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white/95 rounded-2xl shadow-xl p-6 w-[90%] max-w-sm animate-fadeInUp border border-red-200">

        <div className="text-center text-5xl mb-3">🔔</div>
        <h3 className="text-xl font-bold text-center text-green-700 mb-4">
          {message}
        </h3>

        <div className="flex gap-3 mt-4">
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md"
          >
            Sí, eliminar
          </button>

          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg bg-red-600 !bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
