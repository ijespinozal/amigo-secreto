import { useState } from "react";
import api from "../api";

export default function GiftForm({ onAdded }) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [donation, setDonation] = useState("");
  const [link, setLink] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/user/gift", { title, note, donation, link });
      setTitle(""); setNote(""); setDonation(""); setLink("");
      if (onAdded) onAdded();
      alert("Opción guardada 🎁");
    } catch (err) {
      console.error(err);
      alert("Error guardando opción");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">

      <input
        className="input input-bordered w-full"
        placeholder="Título del regalo"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />

      <input
        className="input input-bordered w-full"
        placeholder="Observación"
        value={note}
        onChange={e => setNote(e.target.value)}
      />

      <input
        className="input input-bordered w-full"
        placeholder="Donación (ej: traeré panetón)"
        value={donation}
        onChange={e => setDonation(e.target.value)}
      />

      <input
        className="input input-bordered w-full"
        placeholder="Link del regalo (opcional)"
        value={link}
        onChange={e => setLink(e.target.value)}
        required
      />

      <button className="btn btn-primary w-full" type="submit">
        🎄 Agregar opción
      </button>
    </form>
  );
}
