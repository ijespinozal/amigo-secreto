import { useState } from "react";
import api, { getErrorMessage } from "../../api";
import Card from "../../components/Card";
import ConfirmModal from "../../components/ConfirmModal";
import EventFormModal from "../../components/EventFormModal";
import TemporaryPasswordModal from "../../components/TemporaryPasswordModal";
import EventCard from "../../components/admin/EventCard";
import EventFields from "../../components/admin/EventFields";
import StatCard from "../../components/admin/StatCard";
import UsersList from "../../components/admin/UsersList";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import useApiData from "../../hooks/useApiData";
import useAuth from "../../hooks/useAuth";
import useDialog from "../../hooks/useDialog";
import { todayISO } from "../../utils/date";
import { EMPTY_EVENT, validateEvent } from "../../utils/event";
import { omit } from "../../utils/object";

const PAGE_SIZE = 6;

export default function AdminDashboard() {
  const { user } = useAuth();
  const dialog = useDialog();
  const eventsQuery = useApiData("/admin/events");
  const usersQuery = useApiData("/admin/users");
  const events = eventsQuery.data?.events ?? [];
  const users = usersQuery.data?.users ?? [];

  const [newEvent, setNewEvent] = useState(EMPTY_EVENT);
  const [newEventErrors, setNewEventErrors] = useState({});
  const [creating, setCreating] = useState(false);

  const [editingEvent, setEditingEvent] = useState(null);
  const [savingEvent, setSavingEvent] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState(null);

  // Confirmación de acciones: { message, details, confirmLabel, tone, icon, action }
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
      setConfirm(null);
      dialog.alert({ type: "error", message: getErrorMessage(err) });
    } finally {
      setConfirmLoading(false);
    }
  };

  // ---------- Eventos ----------
  // Al editar un campo se borra su error: el mensaje no queda desactualizado.
  const changeNewEvent = (next, name) => {
    setNewEvent(next);
    setNewEventErrors((prev) => omit(prev, name));
  };

  const createEvent = async (e) => {
    e.preventDefault();
    const errors = validateEvent(newEvent);
    setNewEventErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setCreating(true);
    try {
      const res = await api.post("/admin/event", newEvent);
      eventsQuery.setData((prev) => ({ events: [res.data.event, ...(prev?.events ?? [])] }));
      setNewEvent(EMPTY_EVENT);
      dialog.alert({ type: "success", icon: "🎄", title: "¡Evento creado!", message: `"${res.data.event.title}" ya está listo. Ahora agrega a sus participantes.` });
    } catch (err) {
      dialog.alert({ type: "error", title: "No se pudo crear el evento", message: getErrorMessage(err) });
    } finally {
      setCreating(false);
    }
  };

  const saveEvent = async (form) => {
    setSavingEvent(true);
    try {
      const res = await api.put(`/admin/event/${editingEvent.id}`, form);
      replaceEvent(res.data.event);
      setEditingEvent(null);
    } catch (err) {
      dialog.alert({ type: "error", title: "No se pudo actualizar el evento", message: getErrorMessage(err) });
    } finally {
      setSavingEvent(false);
    }
  };

  const askDeleteEvent = (ev) =>
    setConfirm({
      icon: "🗑️",
      message: `¿Eliminar el evento "${ev.title}"?`,
      details: "Se eliminarán también sus participantes, opciones de regalo, cronograma y sorteo. Esta acción no se puede deshacer.",
      confirmLabel: "Sí, eliminar",
      action: async () => {
        await api.delete(`/admin/event/${ev.id}`);
        eventsQuery.setData((prev) => ({ events: prev.events.filter((e) => e.id !== ev.id) }));
      },
    });

  const askDraw = (ev) =>
    setConfirm({
      icon: "🎁",
      message: `¿Realizar el sorteo de "${ev.title}"?`,
      details: `Se asignará un amigo secreto a cada uno de los ${ev.participantsCount} participantes. Después del sorteo no podrás agregar ni quitar participantes, salvo que lo reabras.`,
      confirmLabel: "Sí, sortear",
      tone: "primary",
      action: async () => {
        const res = await api.post("/admin/draw", { eventId: ev.id });
        replaceEvent(res.data.event);
        dialog.alert({ type: "success", title: "¡Sorteo realizado!", message: "Cada participante ya puede ver a su amigo secreto." });
      },
    });

  const askResetDraw = (ev) =>
    setConfirm({
      icon: "🔄",
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
      icon: "🔑",
      message: `¿Resetear la contraseña de ${u.firstName}?`,
      details: "Se generará una contraseña temporal aleatoria. Su contraseña actual dejará de funcionar.",
      confirmLabel: "Sí, resetear",
      tone: "primary",
      action: async () => {
        const res = await api.post("/admin/reset-password", { userId: u.id });
        setTemporaryPassword({ userName: `${u.firstName} ${u.lastName ?? ""}`.trim(), password: res.data.temporaryPassword });
      },
    });

  const askDeleteUser = (u) =>
    setConfirm({
      icon: "🗑️",
      message: `¿Eliminar a ${u.firstName} ${u.lastName ?? ""}?`,
      details: "Su cuenta se elimina de forma permanente. Sus participaciones en eventos se conservan como \"sin cuenta\".",
      confirmLabel: "Sí, eliminar",
      action: async () => {
        await api.delete(`/admin/user/${u.id}`);
        usersQuery.setData((prev) => ({ users: prev.users.filter((x) => x.id !== u.id) }));
      },
    });

  const drawsDone = events.filter((ev) => ev.drawDone).length;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">

      {/* TÍTULO Y RESUMEN */}
      <section className="flex flex-col gap-5">
        <div className="text-center sm:text-left">
          <h1 className="font-festive font-bold text-3xl sm:text-4xl text-on-page drop-shadow-md tracking-tight">
            Panel de administración <span aria-hidden="true">🎅</span>
          </h1>
          <p className="font-festive font-medium text-lg text-on-page-accent">Organiza eventos, participantes y sorteos.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl">
          <StatCard icon="🎄" value={events.length} label="Eventos" />
          <StatCard icon="🎁" value={drawsDone} label="Sorteados" />
          <StatCard icon="👥" value={users.length} label="Usuarios" />
        </div>
      </section>

      {/* CREAR EVENTO */}
      <Card title={<><span aria-hidden="true">🎄</span> Crear nuevo evento</>}>
        <form onSubmit={createEvent} noValidate className="flex flex-col gap-4">
          <EventFields value={newEvent} errors={newEventErrors} onChange={changeNewEvent} minDate={todayISO()} />
          <div className="flex justify-end">
            <Button type="submit" disabled={creating} className="w-full sm:w-auto">
              {creating ? "Creando..." : <>Crear evento <span aria-hidden="true">🎁</span></>}
            </Button>
          </div>
        </form>
      </Card>

      {/* EVENTOS */}
      <Card
        title={<><span aria-hidden="true">🎅</span> Eventos creados</>}
        actions={events.length > 0 && <Badge tone="gold">{events.length} {events.length === 1 ? "evento" : "eventos"}</Badge>}
      >
        {eventsQuery.error ? (
          <div className="text-center font-semibold text-red-700 space-y-3">
            <p>{getErrorMessage(eventsQuery.error, "No se pudieron cargar los eventos.")}</p>
            <Button variant="secondary" size="sm" onClick={eventsQuery.reload}>Reintentar</Button>
          </div>
        ) : eventsQuery.loading && events.length === 0 ? (
          <p className="text-center font-semibold text-ink-soft">Cargando eventos...</p>
        ) : events.length === 0 ? (
          <p className="text-center font-semibold text-ink-soft">🎄 Aún no hay eventos. Crea el primero arriba.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {events.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                onEdit={() => setEditingEvent(ev)}
                onDelete={() => askDeleteEvent(ev)}
                onDraw={() => askDraw(ev)}
                onResetDraw={() => askResetDraw(ev)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* USUARIOS */}
      <Card
        title={<><span aria-hidden="true">👥</span> Usuarios registrados</>}
        actions={users.length > 0 && <Badge tone="gold">{users.length} usuarios</Badge>}
      >
        {usersQuery.error ? (
          <div className="text-center font-semibold text-red-700 space-y-3">
            <p>{getErrorMessage(usersQuery.error, "No se pudieron cargar los usuarios.")}</p>
            <Button variant="secondary" size="sm" onClick={usersQuery.reload}>Reintentar</Button>
          </div>
        ) : users.length === 0 ? (
          <p className="text-center font-semibold text-ink-soft">
            {usersQuery.loading ? "Cargando usuarios..." : "No hay usuarios registrados."}
          </p>
        ) : (
          <>
            <UsersList
              users={visibleUsers}
              currentUserId={user.id}
              onResetPassword={askResetPassword}
              onDelete={askDeleteUser}
            />

            {totalPages > 1 && (
              <nav aria-label="Paginación de usuarios" className="flex justify-center items-center gap-3 mt-5">
                <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setCurrentPage(page - 1)}>
                  ← Anterior
                </Button>
                <span className="text-sm font-bold text-ink-soft">Página {page} de {totalPages}</span>
                <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setCurrentPage(page + 1)}>
                  Siguiente →
                </Button>
              </nav>
            )}
          </>
        )}
      </Card>

      {/* MODALES */}
      <ConfirmModal
        open={confirm !== null}
        icon={confirm?.icon}
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
