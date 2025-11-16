import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../api";
import ParticipantList from "../../components/ParticipantList";

export default function ParticipantsPage() {
  const { id } = useParams();
  const [participants, setParticipants] = useState([]);
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [phone, setPhone] = useState("");

  const load = async () => {
    try {
      const res = await api.get(`/admin/event/${id}/participants`);
      setParticipants(res.data);
    } catch {
      alert("Error cargando participantes");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    try {
      await api.post("/admin/participant", {
        eventId: id,
        phone,
        firstName,
        lastName,
      });

      setFirst("");
      setLast("");
      setPhone("");
      load();
    } catch {
      alert("Error agregando participante");
    }
  };

  const remove = async (participantId) => {
    if (!window.confirm("¿Seguro que deseas eliminar este participante?")) return;

    try {
      await api.delete(`/admin/participant/${participantId}`);
      load();
    } catch (err) {
      alert("Error eliminando participante");
    }
  };


  return (
    <div className="space-y-8 p-4">

      {/* TÍTULO */}
      <h2 className="text-3xl font-extrabold text-center text-green-700">
        🎄 Participantes del Evento #{id}
      </h2>

      {/* FORMULARIO */}
      <div className="p-6 rounded-2xl bg-white border border-green-200 shadow-md max-w-3xl mx-auto">
        <h3 className="text-xl font-bold text-green-800 mb-4">
          ➕ Agregar nuevo participante
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="input input-bordered w-full rounded-lg"
            placeholder="Nombre"
            value={firstName}
            onChange={(e) => setFirst(e.target.value)}
          />
          <input
            className="input input-bordered w-full rounded-lg"
            placeholder="Apellido"
            value={lastName}
            onChange={(e) => setLast(e.target.value)}
          />
          <input
            className="input input-bordered w-full rounded-lg"
            placeholder="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <button
          onClick={add}
          className="mt-4 w-full md:w-auto px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 hover:scale-[1.02] transition shadow-md"
        >
          Agregar 🎁
        </button>
      </div>

      {/* LISTA DE PARTICIPANTES */}
      <ParticipantList participants={participants} onRemove={remove} />

    </div>
  );
}
