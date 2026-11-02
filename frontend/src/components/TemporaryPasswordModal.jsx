import { useState } from "react";

/**
 * Muestra la contraseña temporal generada por el backend. Es la única vez que
 * se puede ver: en la base de datos solo queda su hash.
 */
export default function TemporaryPasswordModal({ open, userName, password, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const close = () => {
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-sm animate-fadeInUp border border-green-200">
        <div className="text-center text-5xl mb-3">🔑</div>
        <h3 className="text-xl font-bold text-center text-green-700">Contraseña temporal</h3>
        <p className="text-sm text-gray-600 text-center mt-1">
          Entrégasela a <strong>{userName}</strong> y pídele que la cambie al ingresar.
        </p>

        <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-100 border border-gray-300 p-3">
          <code className="flex-1 text-center text-2xl font-mono tracking-wider select-all">{password}</code>
          <button
            onClick={copy}
            className="px-3 py-1 rounded !bg-green-700 text-white text-sm hover:!bg-green-800"
          >
            {copied ? "¡Copiada!" : "Copiar"}
          </button>
        </div>

        <p className="text-xs text-red-600 text-center mt-3">
          ⚠️ Esta contraseña no se volverá a mostrar.
        </p>

        <button
          onClick={close}
          className="mt-4 w-full py-2 rounded-lg !bg-red-600 hover:bg-red-700 text-white font-semibold"
        >
          Listo
        </button>
      </div>
    </div>
  );
}
