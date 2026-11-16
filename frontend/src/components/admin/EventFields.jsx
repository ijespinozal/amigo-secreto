import TextField from "../ui/TextField";

/**
 * Campos de un evento (alta y edición).
 * @param {object} value    { title, description, date_event, startTime, location }
 * @param {object} errors   errores por campo
 * @param {(next) => void} onChange recibe el formulario completo actualizado
 * @param {string} [minDate] fecha mínima "YYYY-MM-DD" (al crear: hoy)
 */
export default function EventFields({ value, errors = {}, onChange, minDate }) {
  const field = (name) => ({
    value: value[name],
    error: errors[name],
    onChange: (e) => onChange({ ...value, [name]: e.target.value }, name),
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <TextField className="sm:col-span-2" label="Título del evento" placeholder="Ej: Navidad 2026" maxLength={255} {...field("title")} />
      <TextField label="Fecha del evento" type="date" min={minDate} {...field("date_event")} />
      <TextField label="Hora de inicio" type="time" hint="Opcional" {...field("startTime")} />
      <TextField
        label="Presupuesto sugerido"
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        prefix="S/"
        placeholder="Ej: 50"
        hint="Opcional. Monto máximo sugerido por regalo."
        {...field("budget")}
      />
      <TextField
        label="Lugar"
        icon="📍"
        placeholder="Ej: Casa de Fabricio, Av. Los Álamos 123"
        maxLength={255}
        hint="Opcional. Se abre en Google Maps."
        {...field("location")}
      />
      <label className="sm:col-span-2 flex items-start gap-3 p-3.5 rounded-xl bg-white border-2 border-amber-200/80 cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-pine-700/30">
        <input
          type="checkbox"
          checked={value.lockGiftsAfterDraw}
          onChange={(e) => onChange({ ...value, lockGiftsAfterDraw: e.target.checked }, "lockGiftsAfterDraw")}
          className="w-5 h-5 m-0 mt-0.5 shrink-0 accent-pine-700 cursor-pointer"
        />
        <span>
          <span className="block font-bold text-sm text-[#4A2E1B]">
            🔒 Bloquear editar y eliminar opciones de regalo después del sorteo
          </span>
          <span className="block text-xs font-semibold text-stone-500 mt-0.5">
            Recomendado: quien regala ya pudo verlas o comprarlas. Si lo desmarcas, podrán cambiarlas aunque el evento
            esté sorteado. Agregar opciones siempre se permite hasta 3.
          </span>
        </span>
      </label>
      <TextField
        className="sm:col-span-2"
        label="Descripción"
        placeholder="Opcional: código de vestimenta, qué llevar, detalles..."
        maxLength={2000}
        {...field("description")}
      />
    </div>
  );
}
