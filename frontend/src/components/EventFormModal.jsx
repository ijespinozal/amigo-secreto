import { useId, useState } from "react";
import { omit } from "../utils/object";
import { toEventForm, validateEvent } from "../utils/event";
import EventFields from "./admin/EventFields";
import Button from "./ui/Button";
import Modal from "./ui/Modal";

/**
 * Edición de un evento. El padre debe montarlo con `key={event.id}` para que
 * el formulario se inicialice con cada evento.
 */
export default function EventFormModal({ event, saving = false, onSave, onClose }) {
  const titleId = useId();
  const [form, setForm] = useState(() => toEventForm(event));
  const [errors, setErrors] = useState({});

  // Al editar un campo se borra su error: el mensaje no queda desactualizado.
  const change = (next, name) => {
    setForm(next);
    setErrors((prev) => omit(prev, name));
  };

  const submit = (e) => {
    e.preventDefault();
    const next = validateEvent(form);
    setErrors(next);
    if (Object.keys(next).length === 0) onSave(form);
  };

  return (
    <Modal open onClose={saving ? undefined : onClose} labelledBy={titleId} className="max-w-lg p-6 sm:p-7">
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <div className="text-center">
          <div aria-hidden="true" className="text-4xl mb-1">✏️</div>
          <h2 id={titleId} className="font-festive font-bold text-2xl text-brand-strong">Editar evento</h2>
        </div>

        <fieldset disabled={saving} className="contents">
          <EventFields value={form} errors={errors} onChange={change} />

          <div className="flex gap-3 pt-1">
            <Button type="submit" block className="rounded-xl py-3">
              {saving ? "Guardando..." : "Guardar cambios"}
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
