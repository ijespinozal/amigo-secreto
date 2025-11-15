import { useState, useEffect } from "react";
import api from "../../api";
import Card from "../../components/Card";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/admin/events");
        setEvents(res.data.events);
      } catch (err) {
        console.error("Error cargando eventos:", err);
      }
    };
    fetchEvents();
  }, []);

  const createEvent = async () => {
    try {
      const res = await api.post("/admin/event", { title, description });
      setEvents(prev => [res.data.event, ...prev]);
      setTitle("");
      setDescription("");
      alert("Evento creado 🎄");
    } catch (err) {
      alert("Error creando evento");
    }
  };

  return (
    <div className="space-y-8 p-4">

      {/* ✨ TÍTULO */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-green-700 text-center">
        🎅 Panel de Administración 🎄
      </h1>

      {/* 🎁 CREAR EVENTO */}
      <Card title="🎄 Crear nuevo evento">
        <div className="space-y-3">
          <input
            className="input input-bordered w-full rounded-lg"
            placeholder="Título del evento"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="textarea textarea-bordered w-full rounded-lg"
            placeholder="Descripción del evento"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button
            className="w-full bg-green-700 text-white py-2 rounded-lg font-semibold hover:bg-green-800 hover:scale-[1.02] transition shadow-md"
            onClick={createEvent}
          >
            Crear evento 🎁
          </button>
        </div>
      </Card>

      {/* 🎄 LISTA DE EVENTOS */}
      <Card title="🎅 Eventos creados">
        {events.length === 0 ? (
          <div className="text-center text-sm text-gray-500">
            Aún no hay eventos creados.
          </div>
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              className="p-4 bg-red-50 border border-red-200 rounded-xl mb-3 shadow-sm"
            >
              <div className="
          flex flex-wrap 
          items-start 
          justify-between 
          gap-4
        ">

                {/* TÍTULO DEL EVENTO */}
                <div className="min-w-[200px] flex-1">
                  <div className="font-bold text-lg text-green-800">{ev.title}</div>
                  <div className="text-sm text-gray-600">{ev.description}</div>
                </div>

                {/* BOTONES */}
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/admin/event/${ev.id}/participants`}
                    className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 shadow whitespace-nowrap"
                  >
                    Participantes
                  </Link>

                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow whitespace-nowrap"
                    onClick={async () => {
                      try {
                        await api.post("/admin/draw", { eventId: ev.id });
                        alert("🎉 Sorteo realizado con éxito");
                      } catch {
                        alert("Error al sortear");
                      }
                    }}
                  >
                    🎁 Sortear
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </Card>


    </div>
  );
}
