import TextField from "../ui/TextField";

/** Campos de una opción de regalo (alta y edición). */
export default function GiftFields({ value, errors = {}, onChange }) {
  const update = (field) => (e) => onChange({ ...value, [field]: e.target.value });

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Título del regalo"
        placeholder="Ej: Audífonos inalámbricos"
        value={value.title}
        onChange={update("title")}
        maxLength={255}
        error={errors.title}
      />
      <TextField
        label="Observación"
        multiline
        rows={2}
        placeholder="Opcional: talla, color, marca..."
        value={value.note}
        onChange={update("note")}
        maxLength={1000}
      />
      <TextField
        label="Donación para la reunión"
        placeholder="Opcional: ej. traeré panetón"
        value={value.donation}
        onChange={update("donation")}
        maxLength={255}
        hint="Se muestra a todo el grupo en «Donaciones del evento»."
      />
      <TextField
        label="Link del regalo"
        type="url"
        placeholder="Opcional: https://..."
        value={value.link}
        onChange={update("link")}
        maxLength={500}
        error={errors.link}
      />
    </div>
  );
}
