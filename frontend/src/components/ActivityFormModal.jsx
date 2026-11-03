import { useId, useState } from "react";
import { isHttpUrl } from "../utils/url";
import { omit } from "../utils/object";
import Button from "./ui/Button";
import IconButton from "./ui/IconButton";
import Modal from "./ui/Modal";
import TextField from "./ui/TextField";

// Límites del backend (validation/schemas.js > activitySchema).
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

/** Valores del formulario a partir de una actividad guardada (null -> ""). */
const toForm = (activity) => {
  const source = { ...EMPTY_ACTIVITY, ...(activity ?? {}) };
  return Object.fromEntries(Object.entries(source).map(([k, v]) => [k, v ?? (k === "prizes" ? [] : "")]));
};

/** Errores por campo ({} si es válido). */
const validate = (form) => {
  const errors = {};
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(form.startTime)) errors.startTime = "Indica la hora de la actividad.";
  if (!form.title.trim()) errors.title = "El título es obligatorio.";
  const url = form.referenceUrl.trim();
  if (url && !isHttpUrl(url)) errors.referenceUrl = "Ingresa un link válido que empiece con https://";
  return errors;
};

/**
 * Alta / edición de una actividad del cronograma. El padre debe montarlo con
 * `key` distinto por actividad para que el formulario se inicialice con ella.
 *
 * @param {object|null} activity  null = nueva actividad
 * @param {(values) => void} onSave
 */
export default function ActivityFormModal({ activity, saving = false, onSave, onClose }) {
  const titleId = useId();
  const [form, setForm] = useState(() => toForm(activity));
  const [errors, setErrors] = useState({});

  // Al editar un campo se borra su error: el mensaje no queda desactualizado.
  const field = (name) => ({
    value: form[name],
    error: errors[name],
    onChange: (e) => {
      setForm((prev) => ({ ...prev, [name]: e.target.value }));
      setErrors((prev) => omit(prev, name));
    },
  });

  const pickIcon = (icon) => {
    setForm((prev) => ({ ...prev, icon }));
    setErrors((prev) => omit(prev, "icon"));
  };

  const updatePrize = (index, value) =>
    setForm((prev) => ({ ...prev, prizes: prev.prizes.map((p, i) => (i === index ? value : p)) }));
  const addPrize = () => setForm((prev) => ({ ...prev, prizes: [...prev.prizes, ""] }));
  const removePrize = (index) => setForm((prev) => ({ ...prev, prizes: prev.prizes.filter((_, i) => i !== index) }));

  const submit = (e) => {
    e.preventDefault();
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSave({
      ...form,
      title: form.title.trim(),
      referenceUrl: form.referenceUrl.trim(),
      // Las filas de premio vacías se ignoran en vez de rechazar el formulario.
      prizes: form.prizes.map((p) => p.trim()).filter(Boolean),
    });
  };

  return (
    <Modal open onClose={saving ? undefined : onClose} labelledBy={titleId} className="max-w-lg p-6 sm:p-7">
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <div className="text-center">
          <div aria-hidden="true" className="text-4xl mb-1">{activity ? "✏️" : "🗓️"}</div>
          <h2 id={titleId} className="font-festive font-bold text-2xl text-brand-strong">
            {activity ? "Editar actividad" : "Nueva actividad"}
          </h2>
        </div>

        <fieldset disabled={saving} className="contents">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Hora" type="time" {...field("startTime")} />
            <TextField
              label="Participantes"
              placeholder="10 personas / TODOS"
              maxLength={50}
              hint="Opcional"
              {...field("participantsLabel")}
            />
          </div>

          <TextField label="Título" placeholder="Ej: Torre de vasos 1 vs 1" maxLength={150} {...field("title")} />

          {/* ÍCONO */}
          <div className="flex flex-col gap-1.5">
            <TextField
              label="Ícono"
              className="w-24"
              inputClassName="text-center text-xl"
              maxLength={16}
              {...field("icon")}
            />
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Íconos sugeridos">
              {ICON_SUGGESTIONS.map((icon) => (
                <IconButton
                  key={icon}
                  label={`Usar ${icon}`}
                  aria-pressed={form.icon === icon}
                  onClick={() => pickIcon(icon)}
                  className={form.icon === icon ? "ring-2 ring-pine-700" : ""}
                >
                  {icon}
                </IconButton>
              ))}
            </div>
          </div>

          <TextField
            label="Descripción"
            multiline
            rows={2}
            placeholder="Reglas o detalles de la actividad"
            maxLength={1000}
            hint="Opcional"
            {...field("description")}
          />

          <TextField
            label="Link de ejemplo"
            type="url"
            icon="🎥"
            placeholder="https://www.tiktok.com/..."
            maxLength={500}
            hint="Opcional: un video que muestre cómo se juega."
            {...field("referenceUrl")}
          />

          {/* PREMIOS */}
          <div className="flex flex-col gap-2">
            <p className="font-bold text-sm text-[#4A2E1B]">🏆 Premios</p>
            {form.prizes.length === 0 && (
              <p className="text-xs font-semibold text-stone-500">Sin premios (p. ej. el intercambio de regalos).</p>
            )}
            {form.prizes.map((prize, index) => (
              <div key={index} className="flex items-center gap-2">
                <TextField
                  className="flex-1"
                  aria-label={`Premio ${index + 1}`}
                  placeholder="Ej: 3 audífonos P9"
                  maxLength={255}
                  value={prize}
                  onChange={(e) => updatePrize(index, e.target.value)}
                />
                <IconButton label={`Quitar premio ${index + 1}`} tone="danger" onClick={() => removePrize(index)}>
                  ✕
                </IconButton>
              </div>
            ))}
            {form.prizes.length < MAX_PRIZES && (
              <Button variant="secondary" size="sm" onClick={addPrize} className="self-start">
                + Agregar premio
              </Button>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="submit" block className="rounded-xl py-3">
              {saving ? "Guardando..." : "Guardar"}
            </Button>
            <Button variant="neutral" block onClick={onClose} className="rounded-xl py-3">
              Cancelar
            </Button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
