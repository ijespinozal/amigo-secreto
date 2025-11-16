import { useState, useEffect } from "react";
import api from "../../api";
import Card from "../../components/Card";
import CardWide from "../../components/CardWide";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [users, setUsers] = useState([]);

  // PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const totalPages = Math.ceil(users.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleUsers = users.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/admin/events");
        setEvents(res.data.events);
      } catch (err) {
        console.error("Error cargando eventos:", err);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await api.get("/admin/users");
        setUsers(res.data.users);
      } catch (err) {
        console.error("Error cargando usuarios:", err);
      }
    };
    fetchEvents();
    fetchUsers();
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

  const resetPassword = async (userId) => {
    if (!window.confirm("¿Resetear contraseña a '123456'?")) return;

    try {
      await api.post("/admin/reset-password", { userId });
      alert("Contraseña reseteada ✔");
    } catch (err) {
      alert("Error reseteando contraseña");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("¿Eliminar este usuario PERMANENTEMENTE?")) return;

    try {
      await api.delete(`/admin/user/${userId}`);

      // Quitar el usuario de la tabla sin recargar
      setUsers(prev => prev.filter(u => u.id !== userId));

      alert("Usuario eliminado correctamente ✔");
    } catch (err) {
      alert(err.response?.data?.message || "Error eliminando usuario");
    }
  };


  return (
    <div className="space-y-8 animate-fadeIn">

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

          <input
            className="input input-bordered w-full rounded-lg"
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
                    className="px-4 py-2 w-full bg-green-700 text-center text-white rounded-lg hover:bg-green-800 shadow whitespace-nowrap"
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

      {/* 👥 LISTA DE USUARIOS REGISTRADOS */}
      <CardWide title="👥 Usuarios registrados">

        {/* ESTADO: Sin usuarios */}
        {users.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            No hay usuarios registrados.
          </p>
        ) : (
          <>
            {/* === ESTADOS PARA PAGINACIÓN === */}
            {(() => {

              return (
                <>
                  {/* === TABLA === */}
                  <div className="overflow-x-auto">
                    <table className="table w-full border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="py-3 px-4 text-left">Teléfono</th>
                          <th className="py-3 px-4 text-left">Nombres</th>
                          <th className="py-3 px-4 text-left">Apellidos</th>
                          <th className="py-3 px-4 text-left">Rol</th>
                          <th className="py-3 px-4 text-left">Registro</th>
                          <th className="py-3 px-4 text-center">Acciones</th>
                        </tr>
                      </thead>

                      <tbody>
                        {visibleUsers.map(u => (
                          <tr key={u.id} className="hover:bg-gray-50 transition">
                            <td className="py-3 px-4">{u.phone}</td>
                            <td className="py-3 px-4">{u.firstName}</td>
                            <td className="py-3 px-4">{u.lastName}</td>
                            <td className="py-3 px-4 capitalize">{u.role}</td>
                            <td className="py-3 px-4">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>

                            <td className="py-3 px-4 text-center flex gap-2 justify-center">
                              {/* RESET PASSWORD */}
                              <button
                                className="px-3 py-1 rounded bg-orange-500 text-white hover:bg-orange-600 shadow-sm"
                                onClick={() => resetPassword(u.id)}
                              >
                                Reset
                              </button>

                              {/* ELIMINAR USUARIO */}
                              <button
                                className="px-3 py-1 rounded !bg-red-600 text-white hover:bg-red-700 shadow-sm"
                                onClick={() => deleteUser(u.id)}
                              >
                                Eliminar
                              </button>

                            </td>
                            
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* === PAGINACIÓN === */}
                  <div className="flex justify-center items-center gap-3 mt-4">
                    <button
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      ← Anterior
                    </button>

                    <span className="text-sm text-gray-600">
                      Página {currentPage} de {totalPages}
                    </span>

                    <button
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Siguiente →
                    </button>
                  </div>
                </>
              );
            })()}
          </>
        )}
      </CardWide>
      
    </div>
  );
}
