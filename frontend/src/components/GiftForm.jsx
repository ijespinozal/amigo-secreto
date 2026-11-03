import { useState } from "react";
import api from "../api";
import { MAX_GIFTS_PER_PARTICIPANT } from "../config/rules";
import { EMPTY_GIFT, validateGift } from "../utils/gifts";
import GiftFields from "./gifts/GiftFields";
import Button from "./ui/Button";

/**
 * Alta de una opción de regalo.
 * @param {number} giftsCount cantidad ya registrada (para el límite)
 * @param {() => void} onAdded
 * @param {(error) => void} onError
 */
export default function GiftForm({ giftsCount = 0, onAdded, onError }) {
  const [form, setForm] = useState(EMPTY_GIFT);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const limitReached = giftsCount >= MAX_GIFTS_PER_PARTICIPANT;

  const submit = async (e) => {
    e.preventDefault();
    const next = validateGift(form);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      await api.post("/user/gift", form);
      setForm(EMPTY_GIFT);
      onAdded();
    } catch (err) {
      onError(err);
    } finally {
      setSaving(false);
    }
  };

  if (limitReached) {
    return (
      <div className="text-center py-6 px-2">
        <div aria-hidden="true" className="text-5xl mb-2">🎉</div>
        <p className="font-festive font-bold text-xl text-brand-strong">¡Completaste tus {MAX_GIFTS_PER_PARTICIPANT} opciones!</p>
        <p className="text-sm font-semibold text-ink-soft mt-1">
          Es el máximo por evento. Si quieres cambiar alguna, edítala o elimínala de tu lista.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <fieldset disabled={saving} className="contents">
        <GiftFields value={form} errors={errors} onChange={setForm} />
        <Button type="submit" block disabled={saving} className="rounded-xl py-3">
          {saving ? "Guardando..." : <>Guardar opción <span aria-hidden="true">🎄</span></>}
        </Button>
      </fieldset>
    </form>
  );
}
