import { useState } from "react";

/**
 * Edición de un evento. El padre debe montarlo con `key={event.id}` para que
 * el formulario se inicialice con cada evento.
 */
export default function EventFormModal({ event, saving = false, onSave, onClose }) {
  const [form, setForm] = useState({
    title: event.title ?? "",
    description: event.description ?? "",
    date_event: event.date_event ?? "",
  });

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <form
        onSubmit={submit}
        className="relative bg-white/95 p-7 rounded-3xl shadow-2xl w-[92%] max-w-md animate-fadeInUp border-2 border-green-300 space-y-3"
      >
        <h2 className="text-2xl font-extrabold text-green-700 text-center">✏️ Editar evento</h2>

        <input
          className="input input-bordered w-full rounded-lg"
          placeholder="Título del evento"
          value={form.title}
          onChange={update("title")}
          required
          maxLength={255}
        />

        <input
          className="input input-bordered w-full rounded-lg"
          placeholder="Descripción del evento"
          value={form.description}
          onChange={update("description")}
          maxLength={2000}
        />

        <label className="block text-sm font-medium text-gray-700">
          Fecha del evento
          <input
            type="date"
            className="input input-bordered w-full rounded-lg mt-1"
            value={form.date_event}
            onChange={update("date_event")}
            required
          />
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2 rounded-lg !bg-green-700 hover:!bg-green-800 text-white font-semibold disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2 rounded-lg !bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
