import { useId, useState } from "react";
import { toGiftForm, validateGift } from "../utils/gifts";
import GiftFields from "./gifts/GiftFields";
import Button from "./ui/Button";
import Modal from "./ui/Modal";

/**
 * Edición de una opción de regalo. El padre debe montarlo con `key={gift.id}`
 * para que el formulario se inicialice con cada regalo.
 * @param {(values) => Promise<void>} onSave
 */
export default function EditGiftModal({ gift, onSave, onClose }) {
  const titleId = useId();
  const [form, setForm] = useState(() => toGiftForm(gift));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const next = validateGift(form);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={saving ? undefined : onClose} labelledBy={titleId} className="max-w-md p-6 sm:p-7">
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <div className="text-center">
          <div aria-hidden="true" className="text-4xl mb-1">🎁</div>
          <h2 id={titleId} className="font-festive font-bold text-2xl text-brand-strong">Editar opción de regalo</h2>
        </div>

        <fieldset disabled={saving} className="contents">
          <GiftFields value={form} errors={errors} onChange={setForm} />
          <div className="flex gap-3">
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
