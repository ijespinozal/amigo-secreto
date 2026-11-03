import { useEffect, useRef } from "react";

const STYLES = {
  success: { box: "bg-[#F2FBF4] border-emerald-200", icon: "🎉", title: "¡Listo!", titleColor: "text-pine-800", text: "text-pine-800/85" },
  error: { box: "bg-[#FFF5F5] border-red-200", icon: "🎅", title: "Algo salió mal", titleColor: "text-red-800", text: "text-red-900/80" },
};

/**
 * Aviso flotante (toast) en la parte superior. Se cierra solo a los 4 s o con ✕.
 * @param {"success"|"error"} [type]
 * @param {string} [title] título opcional (por defecto según el tipo)
 */
export default function AlertMessage({ type = "success", title, message, onClose }) {
  const style = STYLES[type] ?? STYLES.success;

  // Se guarda el último onClose en un ref: si fuera dependencia del efecto,
  // cada render del padre (onClose inline) reiniciaría el temporizador.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const timer = setTimeout(() => onCloseRef.current(), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-x-0 top-4 z-[9999] flex justify-center px-4 pointer-events-none">
      <div
        role={type === "error" ? "alert" : "status"}
        className={`pointer-events-auto w-full max-w-md ${style.box} border-2 rounded-2xl shadow-lg p-3.5 flex items-start gap-3 animate-toast-in`}
      >
        <span className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-lg shrink-0" aria-hidden="true">
          {style.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`font-festive font-bold text-sm ${style.titleColor}`}>{title ?? style.title}</p>
          <p className={`text-sm font-semibold mt-0.5 break-words ${style.text}`}>{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 p-0 rounded-full bg-transparent hover:bg-black/5 text-stone-500 hover:text-stone-800 flex items-center justify-center shrink-0"
          aria-label="Cerrar aviso"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
