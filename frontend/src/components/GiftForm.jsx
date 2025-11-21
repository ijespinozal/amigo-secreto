import { useState } from "react";
import api from "../api";

import Spinner from "../components/Spinner";
import AlertMessage from "../components/AlertMessage";

export default function GiftForm({ onAdded }) {
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
        message: err.response?.data?.message || "Error guardando opción"
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

      <form onSubmit={submit} className="space-y-3">
        <input className="input input-bordered w-full"
          placeholder="Título del regalo"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
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
          placeholder="Link del regalo (opcional)"
          value={link}
          onChange={e => setLink(e.target.value)}
        />

        <button className="btn btn-primary w-full" type="submit" disabled={loading}>
          {loading ? <Spinner size="sm" /> : "🎄 Guardar opción"}
        </button>

      </form>
    </div>
  );

}
