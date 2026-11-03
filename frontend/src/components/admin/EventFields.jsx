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
        className="sm:col-span-2"
        label="Lugar"
        icon="📍"
        placeholder="Ej: Casa de Fabricio, Av. Los Álamos 123"
        maxLength={255}
        hint="Opcional. Los participantes podrán abrirlo en Google Maps."
        {...field("location")}
      />
      <TextField
        className="sm:col-span-2"
        label="Descripción"
        placeholder="Opcional: presupuesto sugerido, código de vestimenta, detalles..."
        maxLength={2000}
        {...field("description")}
      />
    </div>
  );
}
