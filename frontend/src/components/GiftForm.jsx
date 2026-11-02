import { useState } from "react";
import api, { getErrorMessage } from "../api";
import { MAX_GIFTS_PER_PARTICIPANT } from "../config/rules";

import Spinner from "../components/Spinner";
import AlertMessage from "../components/AlertMessage";

/**
 * @param {number} giftsCount cantidad de regalos ya registrados (para el límite)
 */
export default function GiftForm({ onAdded, giftsCount = 0 }) {
  const limitReached = giftsCount >= MAX_GIFTS_PER_PARTICIPANT;

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [donation, setDonation] = useState("");
  const [link, setLink] = useState("");

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ show: false, type: "", message: "" });

    try {
      await api.post("/user/gift", { title, note, donation, link });

      setTitle(""); 
      setNote(""); 
      setDonation(""); 
      setLink("");

      if (onAdded) onAdded();

      setAlert({
        show: true,
        type: "success",
        message: "🎁 Opción guardada exitosamente"
      });

    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        type: "error",
        message: getErrorMessage(err, "Error guardando opción")
      });
    }

    setLoading(false);
  };


  return (
    <div className="relative">
      
      {/* ALERTA CENTRAL */}
      {alert.show && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ show: false })}
        />
      )}

      <p className={`text-sm mb-3 ${limitReached ? "text-red-600 font-semibold" : "opacity-70"}`}>
        {limitReached
          ? `Ya registraste ${MAX_GIFTS_PER_PARTICIPANT} opciones (el máximo). Edita o elimina una para agregar otra.`
          : `Opciones registradas: ${giftsCount}/${MAX_GIFTS_PER_PARTICIPANT}`}
      </p>

      <form onSubmit={submit} className="space-y-3">
        <fieldset disabled={limitReached || loading} className="space-y-3">
        <input className="input input-bordered w-full"
          placeholder="Título del regalo"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          maxLength={255}
        />

        <input className="input input-bordered w-full"
          placeholder="Observación"
          value={note}
          onChange={e => setNote(e.target.value)}
        />

        <input className="input input-bordered w-full"
          placeholder="Donación (ej: traeré panetón)"
          value={donation}
          onChange={e => setDonation(e.target.value)}
        />

        <input className="input input-bordered w-full"
          type="url"
          placeholder="Link del regalo (opcional, https://...)"
          value={link}
          onChange={e => setLink(e.target.value)}
          maxLength={500}
        />

        <button className="btn btn-primary w-full" type="submit">
          {loading ? <Spinner size="sm" /> : "🎄 Guardar opción"}
        </button>
        </fieldset>

      </form>
    </div>
  );

}
