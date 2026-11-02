import { useState } from "react";
import api, { getErrorMessage } from "../../api";
import Card from "../../components/Card";
import CardWide from "../../components/CardWide";
import ConfirmModal from "../../components/ConfirmModal";
import EventFormModal from "../../components/EventFormModal";
import TemporaryPasswordModal from "../../components/TemporaryPasswordModal";
import { Link } from "react-router-dom";
import { MIN_PARTICIPANTS_FOR_DRAW } from "../../config/rules";
import useApiData from "../../hooks/useApiData";
import { formatCalendarDate, todayISO } from "../../utils/date";

const PAGE_SIZE = 6;

const formatDateTime = (value) =>
  new Date(value).toLocaleString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Etiqueta de estado del cronograma (nada si el evento no tiene). */
function ScheduleStatusBadge({ event }) {
  const count = event.activitiesCount ?? 0;
  if (count === 0) return null;
  return event.schedulePublished ? (
    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
      📅 Cronograma publicado ({count})
    </span>
  ) : (
    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
      📝 Cronograma en borrador ({count})
    </span>
  );
}

/** Etiqueta de estado del sorteo de un evento. */
function DrawStatusBadge({ event }) {
  return event.drawDone ? (
    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
      ✅ Sorteado el {formatDateTime(event.drawDate)}
    </span>
  ) : (
    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
      ⏳ Sorteo pendiente
    </span>
  );
}

export default function AdminDashboard() {
  const eventsQuery = useApiData("/admin/events");
  const usersQuery = useApiData("/admin/users");
  const events = eventsQuery.data?.events ?? [];
  const users = usersQuery.data?.users ?? [];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateEvent, setDateEvent] = useState("");

  const [editingEvent, setEditingEvent] = useState(null);
  const [savingEvent, setSavingEvent] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState(null);

  // Confirmación genérica: { message, details, confirmLabel, tone, action }
  const [confirm, setConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const visibleUsers = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const replaceEvent = (updated) =>
    eventsQuery.setData((prev) => ({
      events: prev.events.map((ev) => (ev.id === updated.id ? { ...ev, ...updated } : ev)),
    }));

  const runConfirmed = async () => {
    setConfirmLoading(true);
    try {
      await confirm.action();
      setConfirm(null);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setConfirmLoading(false);
    }
  };

  // ---------- Eventos ----------
  const createEvent = async () => {
    if (!title.trim() || !dateEvent) {
      alert("El título y la fecha del evento son obligatorios");
      return;
    }

    try {
      const res = await api.post("/admin/event", { title, description, date_event: dateEvent });
      eventsQuery.setData((prev) => ({ events: [res.data.event, ...(prev?.events ?? [])] }));
      setTitle("");
      setDescription("");
      setDateEvent("");
      alert("Evento creado 🎄");
    } catch (err) {
      alert(getErrorMessage(err, "Error creando evento"));
    }
  };

  const saveEvent = async (form) => {
    setSavingEvent(true);
    try {
      const res = await api.put(`/admin/event/${editingEvent.id}`, form);
      replaceEvent(res.data.event);
      setEditingEvent(null);
    } catch (err) {
      alert(getErrorMessage(err, "Error actualizando evento"));
    } finally {
      setSavingEvent(false);
    }
  };

  const askDeleteEvent = (ev) =>
    setConfirm({
      message: `¿Eliminar el evento "${ev.title}"?`,
      details: "Se eliminarán también sus participantes, opciones de regalo y el sorteo. Esta acción no se puede deshacer.",
      confirmLabel: "Sí, eliminar",
      action: async () => {
        await api.delete(`/admin/event/${ev.id}`);
        eventsQuery.setData((prev) => ({ events: prev.events.filter((e) => e.id !== ev.id) }));
      },
    });

  const askDraw = (ev) =>
    setConfirm({
      message: `¿Realizar el sorteo de "${ev.title}"?`,
      details: `Se asignará un amigo secreto a cada uno de los ${ev.participantsCount} participantes. Después del sorteo no podrás agregar ni quitar participantes, salvo que lo reabras.`,
      confirmLabel: "🎁 Sí, sortear",
      tone: "primary",
      action: async () => {
        const res = await api.post("/admin/draw", { eventId: ev.id });
        replaceEvent(res.data.event);
        alert("🎉 Sorteo realizado con éxito");
      },
    });

  const askResetDraw = (ev) =>
    setConfirm({
      message: `¿Reabrir el sorteo de "${ev.title}"?`,
      details: "Se borrarán las asignaciones actuales. Si alguien ya vio a su amigo secreto, al volver a sortear le puede tocar otra persona.",
      confirmLabel: "Sí, reabrir",
      action: async () => {
        const res = await api.post(`/admin/event/${ev.id}/reset-draw`);
        replaceEvent(res.data.event);
      },
    });

  // ---------- Usuarios ----------
  const askResetPassword = (u) =>
    setConfirm({
      message: `¿Resetear la contraseña de ${u.firstName}?`,
      details: "Se generará una contraseña temporal aleatoria. Su contraseña actual dejará de funcionar.",
      confirmLabel: "Sí, resetear",
      action: async () => {
        const res = await api.post("/admin/reset-password", { userId: u.id });
        setTemporaryPassword({ userName: `${u.firstName} ${u.lastName ?? ""}`.trim(), password: res.data.temporaryPassword });
      },
    });

  const askDeleteUser = (u) =>
    setConfirm({
      message: `¿Eliminar a ${u.firstName} ${u.lastName ?? ""} PERMANENTEMENTE?`,
      details: "Su cuenta se elimina; sus participaciones en eventos se conservan como \"sin cuenta\".",
      confirmLabel: "Sí, eliminar",
      action: async () => {
        await api.delete(`/admin/user/${u.id}`);
        usersQuery.setData((prev) => ({ users: prev.users.filter((x) => x.id !== u.id) }));
      },
    });

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
            maxLength={255}
          />

          <input
            className="input input-bordered w-full rounded-lg"
            placeholder="Descripción del evento"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
          />

          <label className="block text-sm font-medium text-gray-700">
            Fecha del evento
            <input
              type="date"
              className="input input-bordered w-full rounded-lg mt-1"
              min={todayISO()}
              value={dateEvent}
              onChange={(e) => setDateEvent(e.target.value)}
            />
          </label>

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
        {eventsQuery.error ? (
          <div className="text-center text-sm text-red-600">
            {getErrorMessage(eventsQuery.error, "No se pudieron cargar los eventos.")}{" "}
            <button className="underline" onClick={eventsQuery.reload}>Reintentar</button>
          </div>
        ) : eventsQuery.loading && events.length === 0 ? (
          <div className="text-center text-sm text-gray-500">Cargando eventos...</div>
        ) : events.length === 0 ? (
          <div className="text-center text-sm text-gray-500">
            Aún no hay eventos creados.
          </div>
        ) : (
          events.map((ev) => {
            const notEnoughParticipants = (ev.participantsCount ?? 0) < MIN_PARTICIPANTS_FOR_DRAW;
            return (
              <div
                key={ev.id}
                className="p-4 bg-red-50 border border-red-200 rounded-xl mb-3 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">

                  {/* DATOS DEL EVENTO */}
                  <div className="min-w-[200px] flex-1">
                    <div className="font-bold text-lg text-green-800">{ev.title}</div>
                    <div className="text-sm text-gray-600">{ev.description}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      📅 {ev.date_event ? formatCalendarDate(ev.date_event) : "Fecha por definir"}
                      {" · "}👥 {ev.participantsCount ?? 0} participante(s)
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <DrawStatusBadge event={ev} />
                      <ScheduleStatusBadge event={ev} />
                    </div>
                  </div>

                  {/* BOTONES */}
                  {/* Nota: index.css da a todo <button> width:100% y fondo verde; por eso los !bg-* */}
                  <div className="flex flex-col gap-2 w-full sm:w-[230px]">
                    <Link
                      to={`/admin/event/${ev.id}/participants`}
                      className="px-4 py-2 w-full bg-green-700 text-center text-white rounded-lg hover:bg-green-800 shadow whitespace-nowrap"
                    >
                      Participantes
                    </Link>

                    <Link
                      to={`/admin/event/${ev.id}/schedule`}
                      className="px-4 py-2 w-full bg-blue-700 text-center text-white rounded-lg hover:bg-blue-800 shadow whitespace-nowrap"
                    >
                      📅 Cronograma
                    </Link>

                    {ev.drawDone ? (
                      <button
                        className="!py-2 !bg-amber-500 text-white rounded-lg hover:!bg-amber-600 shadow whitespace-nowrap"
                        onClick={() => askResetDraw(ev)}
                      >
                        🔄 Reabrir sorteo
                      </button>
                    ) : (
                      <button
                        className="!py-2 !bg-red-600 text-white rounded-lg hover:!bg-red-700 shadow whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        disabled={notEnoughParticipants}
                        title={notEnoughParticipants ? `Se necesitan al menos ${MIN_PARTICIPANTS_FOR_DRAW} participantes` : undefined}
                        onClick={() => askDraw(ev)}
                      >
                        🎁 Sortear
                      </button>
                    )}

                    <div className="flex gap-2">
                      <button
                        className="flex-1 !py-2 !bg-gray-600 text-white rounded-lg hover:!bg-gray-700 shadow text-sm whitespace-nowrap"
                        title="Editar evento"
                        onClick={() => setEditingEvent(ev)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="flex-1 !py-2 !bg-red-800 text-white rounded-lg hover:!bg-red-900 shadow text-sm whitespace-nowrap"
                        title="Eliminar evento"
                        onClick={() => askDeleteEvent(ev)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </Card>

      {/* 👥 LISTA DE USUARIOS REGISTRADOS */}
      <CardWide title="👥 Usuarios registrados">

        {usersQuery.error ? (
          <p className="text-center text-sm text-red-600">
            {getErrorMessage(usersQuery.error, "No se pudieron cargar los usuarios.")}{" "}
            <button className="underline" onClick={usersQuery.reload}>Reintentar</button>
          </p>
        ) : users.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            {usersQuery.loading ? "Cargando usuarios..." : "No hay usuarios registrados."}
          </p>
        ) : (
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
                        {new Date(u.createdAt).toLocaleDateString("es-PE")}
                      </td>

                      <td className="py-3 px-4 text-center flex gap-2 justify-center">
                        {/* RESET PASSWORD */}
                        <button
                          className="px-3 py-1 rounded bg-orange-500 text-white hover:bg-orange-600 shadow-sm"
                          onClick={() => askResetPassword(u)}
                        >
                          Reset
                        </button>

                        {/* ELIMINAR USUARIO */}
                        <button
                          className="px-3 py-1 rounded !bg-red-600 text-white hover:bg-red-700 shadow-sm"
                          onClick={() => askDeleteUser(u)}
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
                disabled={page === 1}
                onClick={() => setCurrentPage(page - 1)}
              >
                ← Anterior
              </button>

              <span className="text-sm text-gray-600">
                Página {page} de {totalPages}
              </span>

              <button
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40"
                disabled={page === totalPages}
                onClick={() => setCurrentPage(page + 1)}
              >
                Siguiente →
              </button>
            </div>
          </>
        )}
      </CardWide>

      {/* MODALES */}
      <ConfirmModal
        open={confirm !== null}
        message={confirm?.message}
        details={confirm?.details}
        confirmLabel={confirm?.confirmLabel}
        tone={confirm?.tone}
        loading={confirmLoading}
        onConfirm={runConfirmed}
        onCancel={() => setConfirm(null)}
      />

      {editingEvent && (
        <EventFormModal
          key={editingEvent.id}
          event={editingEvent}
          saving={savingEvent}
          onSave={saveEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}

      <TemporaryPasswordModal
        open={temporaryPassword !== null}
        userName={temporaryPassword?.userName}
        password={temporaryPassword?.password}
        onClose={() => setTemporaryPassword(null)}
      />
    </div>
  );
}
