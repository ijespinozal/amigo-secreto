import { useEffect, useRef } from "react";

export default function AlertMessage({ type = "success", message, onClose }) {
  // Se guarda el último onClose en un ref: si fuera dependencia del efecto,
  // cada render del padre (onClose inline) reiniciaría el temporizador.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const timer = setTimeout(() => onCloseRef.current(), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className={`px-6 py-4 rounded-2xl shadow-xl text-white text-center w-[85%] max-w-sm animate-fadeInUp
          ${type === "error" ? "bg-red-600" : "bg-green-600"}
        `}
      >
        <div className="text-4xl mb-2">
          {type === "error" ? "❌" : "🎉"}
        </div>
        <p className="font-semibold text-lg">{message}</p>
      </div>
    </div>
  );
}
