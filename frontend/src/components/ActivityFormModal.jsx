import { useState } from "react";

const MAX_PRIZES = 20;
const ICON_SUGGESTIONS = ["🎄", "🎁", "🎅", "🥤", "🏗️", "🎱", "🎾", "😂", "🌑", "🎤", "💃", "🍽️", "🎉", "🤗"];

const EMPTY_ACTIVITY = {
  startTime: "",
  icon: "",
  title: "",
  participantsLabel: "",
  description: "",
  referenceUrl: "",
  prizes: [],
};

/**
 * Alta / edición de una actividad del cronograma. El padre debe montarlo con
 * `key` distinto por actividad para que el formulario se inicialice con ella.
 *
 * @param {object|null} activity  null = nueva actividad
 */
export default function ActivityFormModal({ activity, saving = false, onSave, onClose }) {
  const [form, setForm] = useState(() => {
    const source = { ...EMPTY_ACTIVITY, ...(activity ?? {}) };
    // null -> "" para inputs controlados
    return Object.fromEntries(Object.entries(source).map(([k, v]) => [k, v ?? (k === "prizes" ? [] : "")]));
  });

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const updatePrize = (index, value) =>
    setForm((prev) => ({ ...prev, prizes: prev.prizes.map((p, i) => (i === index ? value : p)) }));
  const addPrize = () => setForm((prev) => ({ ...prev, prizes: [...prev.prizes, ""] }));
  const removePrize = (index) => setForm((prev) => ({ ...prev, prizes: prev.prizes.filter((_, i) => i !== index) }));

  const submit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      // Las filas de premio vacías se ignoran en vez de rechazar el formulario.
      prizes: form.prizes.map((p) => p.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
      <form
        onSubmit={submit}
        className="relative bg-white p-6 rounded-3xl shadow-2xl w-full max-w-lg animate-fadeInUp border-2 border-green-300 space-y-3 max-h-[92vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-extrabold text-green-700 text-center">
          {activity ? "✏️ Editar actividad" : "➕ Nueva actividad"}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium text-gray-700">
            Hora *
            <input
              type="time"
              className="input input-bordered w-full rounded-lg mt-1"
              value={form.startTime}
              onChange={update("startTime")}
              required
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Participantes
            <input
              className="input input-bordered w-full rounded-lg mt-1"
              placeholder="10 personas / TODOS"
              value={form.participantsLabel}
              onChange={update("participantsLabel")}
              maxLength={50}
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-gray-700">
          Título *
          <input
            className="input input-bordered w-full rounded-lg mt-1"
            placeholder="Ej: Torre de vasos 1 vs 1"
            value={form.title}
            onChange={update("title")}
            required
            maxLength={150}
          />
        </label>

        <div className="text-sm font-medium text-gray-700">
          Ícono
          <div className="flex items-center gap-2 mt-1">
            <input
              className="input input-bordered w-20 rounded-lg text-center text-xl"
              value={form.icon}
              onChange={update("icon")}
              maxLength={16}
              aria-label="Ícono"
            />
            <div className="flex flex-wrap gap-1">
              {ICON_SUGGESTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, icon }))}
                  className={`!w-9 !h-9 !p-0 text-lg rounded-lg border ${
                    form.icon === icon ? "!bg-green-100 border-green-600" : "!bg-white border-gray-200"
                  }`}
                  title={`Usar ${icon}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="block text-sm font-medium text-gray-700">
          Descripción
          <textarea
            className="textarea textarea-bordered w-full rounded-lg mt-1"
            placeholder="Reglas o detalles de la actividad (opcional)"
            rows={2}
            value={form.description}
            onChange={update("description")}
            maxLength={1000}
          />
        </label>

        <label className="block text-sm font-medium text-gray-700">
          Link de ejemplo
          <input
            type="url"
            className="input input-bordered w-full rounded-lg mt-1"
            placeholder="https://www.tiktok.com/... (opcional)"
            value={form.referenceUrl}
            onChange={update("referenceUrl")}
            maxLength={500}
          />
        </label>

        {/* PREMIOS */}
        <div className="text-sm font-medium text-gray-700">
          🏆 Premios
          <div className="space-y-2 mt-1">
            {form.prizes.length === 0 && (
              <p className="text-xs text-gray-500">Sin premios (p. ej. el intercambio de regalos).</p>
            )}
            {form.prizes.map((prize, index) => (
              <div key={index} className="flex gap-2">
                <input
                  className="input input-bordered flex-1 rounded-lg"
                  placeholder="Ej: 3 audífonos P9"
                  value={prize}
                  onChange={(e) => updatePrize(index, e.target.value)}
                  maxLength={255}
                />
                <button
                  type="button"
                  onClick={() => removePrize(index)}
                  className="!w-10 !p-0 !bg-red-100 !text-red-700 rounded-lg hover:!bg-red-200"
                  title="Quitar premio"
                >
                  ✕
                </button>
              </div>
            ))}
            {form.prizes.length < MAX_PRIZES && (
              <button
                type="button"
                onClick={addPrize}
                className="!w-auto !py-1 !px-3 text-sm !bg-green-50 !text-green-800 border border-green-300 rounded-lg hover:!bg-green-100"
              >
                + Agregar premio
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 !py-2 rounded-lg !bg-green-700 hover:!bg-green-800 text-white font-semibold disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 !py-2 rounded-lg !bg-gray-500 hover:!bg-gray-600 text-white font-semibold"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
