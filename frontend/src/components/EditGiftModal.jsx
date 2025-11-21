import { useState, useEffect } from "react";

export default function EditGiftModal({ open, gift, onClose, onSave }) {
  const [form, setForm] = useState(gift || {});

  // 🔥 Actualiza el formulario cuando cambie el regalo seleccionado
  useEffect(() => {
    setForm(gift || {});
  }, [gift]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">

      {/* CONTENEDOR */}
      <div className="relative bg-white/95 backdrop-blur-xl p-7 rounded-3xl shadow-2xl w-full max-w-md animate-fadeInUp border-2 border-red-300">

        {/* 🎄 HEADER NAVIDEÑO */}
        <div className="text-center mb-4">
          <div className="text-4xl mb-1">🎄</div>
          <h2 className="text-2xl font-extrabold text-red-700 drop-shadow">
            Editar opción de regalo
          </h2>
        </div>

        {/* FORMULARIO */}
        <div className="space-y-3">

          <input
            type="text"
            placeholder="Título"
            value={form.title || ""}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="input input-bordered w-full bg-white/80 border-red-300 focus:border-green-600 rounded-xl shadow-sm"
          />

          <input
            placeholder="Nota"
            value={form.note || ""}
            onChange={e => setForm({ ...form, note: e.target.value })}
            className="textarea textarea-bordered w-full bg-white/80 border-red-300 focus:border-green-600 rounded-xl shadow-sm"
            rows={3}
          />

          <input
            type="text"
            placeholder="Donación (opcional)"
            value={form.donation || ""}
            onChange={e => setForm({ ...form, donation: e.target.value })}
            className="input input-bordered w-full bg-white/80 border-red-300 focus:border-green-600 rounded-xl shadow-sm"
          />

          <input
            type="text"
            placeholder="Link del regalo (opcional)"
            value={form.link || ""}
            onChange={e => setForm({ ...form, link: e.target.value })}
            className="input input-bordered w-full bg-white/80 border-red-300 focus:border-green-600 rounded-xl shadow-sm"
          />

        </div>

        {/* BOTONES */}
        <div className="flex gap-4 mt-6">

          <button
            onClick={() => onSave(form)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl shadow-md transition flex items-center justify-center gap-1"
          >
            <span>🎁</span> Guardar
          </button>

          <button
            onClick={onClose}
            className="flex-1 !bg-red-600 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-xl shadow-md transition"
          >
            Cancelar
          </button>

        </div>

        {/* ⭐ DECORACIÓN NAVIDEÑA SUPERIOR */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-4xl drop-shadow">
          ⭐
        </div>

      </div>
    </div>
  );
}
