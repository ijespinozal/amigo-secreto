import { useId, useState } from "react";
import Button from "./ui/Button";
import Modal from "./ui/Modal";
import TextField from "./ui/TextField";

/**
 * Edición de un evento. El padre debe montarlo con `key={event.id}` para que
 * el formulario se inicialice con cada evento.
 */
export default function EventFormModal({ event, saving = false, onSave, onClose }) {
  const titleId = useId();
  const [form, setForm] = useState({
    title: event.title ?? "",
    description: event.description ?? "",
    date_event: event.date_event ?? "",
  });
  const [errors, setErrors] = useState({});

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = "El título es obligatorio.";
    if (!form.date_event) next.date_event = "La fecha es obligatoria.";
    setErrors(next);
    if (Object.keys(next).length === 0) onSave(form);
  };

  return (
    <Modal open onClose={saving ? undefined : onClose} labelledBy={titleId} className="max-w-md p-6 sm:p-7">
      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="text-center">
          <div aria-hidden="true" className="text-4xl mb-1">✏️</div>
          <h2 id={titleId} className="font-festive font-bold text-2xl text-brand-strong">Editar evento</h2>
        </div>

        <TextField label="Título del evento" value={form.title} onChange={update("title")} maxLength={255} error={errors.title} />
        <TextField label="Descripción" value={form.description} onChange={update("description")} maxLength={2000} placeholder="Opcional" />
        <TextField label="Fecha del evento" type="date" value={form.date_event} onChange={update("date_event")} error={errors.date_event} />

        <div className="flex gap-3 pt-2">
          <Button type="submit" block disabled={saving} className="rounded-xl py-3">
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
          <Button variant="neutral" block disabled={saving} onClick={onClose} className="rounded-xl py-3">
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
