import { useState, useEffect, useRef } from "react";
import api from "../api";

export default function ChangePasswordModal({ open, onClose }) {
  if (!open) return null;

  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState(null);

  const modalRef = useRef(null);

  // Cerrar con tecla ESC
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Cerrar clic afuera
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPass !== confirm) {
      setMsg({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }

    try {
      const res = await api.post("/user/change-password", {
        currentPassword: current,
        newPassword: newPass,
      });

      setMsg({ type: "success", text: res.data.message });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Error inesperado",
      });
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
    >

      {/* CUERPO DEL MODAL */}
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-96 p-6 relative animate-fadeInUp"
      >
        <h2 className="text-center text-2xl font-bold text-green-700 mb-4">
          🎄 Cambiar contraseña 🎁
        </h2>

        {msg && (
          <div
            className={`p-3 text-center rounded-lg mb-4 text-sm font-medium ${
              msg.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Contraseña actual"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
          />

          <input
            type="password"
            placeholder="Nueva contraseña"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
          />

          <input
            type="password"
            placeholder="Confirmar nueva contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
          />

          {/* BOTONES JUNTOS */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="w-1/2 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold shadow-md transition-all"
            >
              Guardar
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 !bg-red-600 hover:bg-gray-400 text-gray-800 rounded-xl font-semibold shadow transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
