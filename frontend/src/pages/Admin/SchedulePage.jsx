import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../../api";
import ActivityFormModal from "../../components/ActivityFormModal";
import ConfirmModal from "../../components/ConfirmModal";
import ScheduleModal from "../../components/ScheduleModal";
import Spinner from "../../components/Spinner";
import useApiData from "../../hooks/useApiData";
import useDialog from "../../hooks/useDialog";
import { formatCalendarDate } from "../../utils/date";
import { formatScheduleTime, referenceLinkLabel } from "../../utils/schedule";

// Nota: index.css da a todo <button> width:100%, padding y fondo verde; por eso los !-utilities.
const smallButton = "!w-9 !h-9 !p-0 rounded-lg text-base disabled:opacity-30 disabled:cursor-not-allowed";

export default function SchedulePage() {
  const { id } = useParams();
  const dialog = useDialog();
  const { data, error, loading, reload, setData } = useApiData(`/admin/event/${id}/schedule`);
  const event = data?.event;
  const activities = data?.activities ?? [];

  // undefined = cerrado; null = nueva actividad; objeto = edición
  const [editing, setEditing] = useState(undefined);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const setActivities = (next) => setData((prev) => ({ ...prev, activities: next }));
  const setPublished = (schedulePublished) =>
    setData((prev) => ({ ...prev, event: { ...prev.event, schedulePublished } }));

  const saveActivity = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        const res = await api.put(`/admin/schedule/activities/${editing.id}`, form);
        setActivities(activities.map((a) => (a.id === editing.id ? res.data.activity : a)));
      } else {
        const res = await api.post(`/admin/event/${id}/schedule/activities`, form);
        setActivities([...activities, res.data.activity]);
      }
      setEditing(undefined);
    } catch (err) {
      dialog.alert({ type: "error", title: "No se pudo guardar la actividad", message: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      const res = await api.delete(`/admin/schedule/activities/${toDelete.id}`);
      setActivities(activities.filter((a) => a.id !== toDelete.id));
      if (res.data.unpublished) setPublished(false);
      setToDelete(null);
    } catch (err) {
      setToDelete(null);
      dialog.alert({ type: "error", title: "No se pudo eliminar la actividad", message: getErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const move = async (index, delta) => {
    const target = index + delta;
    const ids = activities.map((a) => a.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];

    setBusy(true);
    try {
      const res = await api.put(`/admin/event/${id}/schedule/order`, { activityIds: ids });
      setActivities(res.data.activities);
    } catch (err) {
      dialog.alert({ type: "error", title: "No se pudo cambiar el orden", message: getErrorMessage(err) });
      reload();
    } finally {
      setBusy(false);
    }
  };

  const togglePublished = async () => {
    setBusy(true);
    try {
      const res = await api.put(`/admin/event/${id}/schedule/visibility`, { published: !event.schedulePublished });
      setPublished(res.data.schedulePublished);
    } catch (err) {
      dialog.alert({ type: "error", title: "No se pudo cambiar la visibilidad", message: getErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-6 rounded-2xl bg-white shadow-md text-center space-y-3">
        <p className="text-red-600 font-semibold">{getErrorMessage(error, "No se pudo cargar el cronograma.")}</p>
        <div className="flex justify-center gap-3">
          <button className="btn btn-sm !w-auto" onClick={reload}>Reintentar</button>
          <Link to="/admin/dashboard" className="btn btn-sm">Volver al panel</Link>
        </div>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-3xl mx-auto">

      {/* TÍTULO */}
      <div className="text-center space-y-1">
        <Link to="/admin/dashboard" className="text-white/90 text-sm hover:underline">← Volver al panel</Link>
        <h2 className="text-3xl font-extrabold text-green-700">📅 Cronograma</h2>
        <p className="text-white/90">
          🎄 {event.title} · {event.date_event ? formatCalendarDate(event.date_event) : "Fecha por definir"}
        </p>
      </div>

      {/* ESTADO Y ACCIONES */}
      <div className="p-5 rounded-2xl bg-white shadow-md border border-green-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {event.schedulePublished ? (
              <p className="font-semibold text-green-800">🟢 Publicado — los participantes lo ven</p>
            ) : (
              <p className="font-semibold text-gray-700">⚪ Borrador — solo tú lo ves</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {activities.length === 0
                ? "Si el evento no tendrá cronograma, déjalo vacío: los participantes no verán nada."
                : `${activities.length} actividad(es). Se muestra automáticamente a cada participante la primera vez y cuando lo modificas.`}
            </p>
          </div>
          <button
            onClick={togglePublished}
            disabled={busy || (!event.schedulePublished && activities.length === 0)}
            title={!event.schedulePublished && activities.length === 0 ? "Agrega al menos una actividad" : undefined}
            className={`!w-auto !px-4 !py-2 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
              event.schedulePublished ? "!bg-gray-600 hover:!bg-gray-700" : "!bg-green-700 hover:!bg-green-800"
            }`}
          >
            {event.schedulePublished ? "🙈 Ocultar" : "🚀 Publicar"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setEditing(null)}
            className="!w-auto !px-4 !py-2 rounded-lg !bg-red-600 hover:!bg-red-700 text-white font-semibold"
          >
            ➕ Agregar actividad
          </button>
          <button
            onClick={() => setPreviewOpen(true)}
            disabled={activities.length === 0}
            className="!w-auto !px-4 !py-2 rounded-lg !bg-amber-500 hover:!bg-amber-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            👁️ Vista previa
          </button>
        </div>
      </div>

      {/* ACTIVIDADES */}
      {activities.length === 0 ? (
        <p className="text-center text-white/90">Este evento aún no tiene actividades en su cronograma.</p>
      ) : (
        <ol className="space-y-3">
          {activities.map((act, index) => (
            <li key={act.id} className="p-4 bg-white rounded-xl shadow-sm border border-red-200/40 flex gap-3 items-start">
              <div className="text-3xl w-10 text-center shrink-0">{act.icon || "⭐"}</div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">⏰ {formatScheduleTime(act.startTime)}</span>
                  {act.participantsLabel && (
                    <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800">👥 {act.participantsLabel}</span>
                  )}
                  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">🏆 {act.prizes.length} premio(s)</span>
                </div>
                <p className="font-bold text-red-700 mt-2 break-words">{act.title}</p>
                {act.description && <p className="text-sm text-gray-600 italic break-words">{act.description}</p>}
                {act.prizes.length > 0 && (
                  <p className="text-sm text-gray-700 mt-1 break-words">{act.prizes.join(" · ")}</p>
                )}
                {act.referenceUrl && (
                  <a href={act.referenceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-700 underline">
                    🎥 {referenceLinkLabel(act.referenceUrl)}
                  </a>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1 shrink-0">
                <button
                  onClick={() => move(index, -1)}
                  disabled={busy || index === 0}
                  className={`${smallButton} !bg-gray-100 !text-gray-700 hover:!bg-gray-200`}
                  title="Subir"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={busy || index === activities.length - 1}
                  className={`${smallButton} !bg-gray-100 !text-gray-700 hover:!bg-gray-200`}
                  title="Bajar"
                >
                  ↓
                </button>
                <button
                  onClick={() => setEditing(act)}
                  disabled={busy}
                  className={`${smallButton} !bg-gray-600 hover:!bg-gray-700`}
                  title="Editar actividad"
                >
                  ✏️
                </button>
                <button
                  onClick={() => setToDelete(act)}
                  disabled={busy}
                  className={`${smallButton} !bg-red-700 hover:!bg-red-800`}
                  title="Eliminar actividad"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {/* MODALES */}
      {editing !== undefined && (
        <ActivityFormModal
          key={editing?.id ?? "new"}
          activity={editing}
          saving={saving}
          onSave={saveActivity}
          onClose={() => setEditing(undefined)}
        />
      )}

      <ConfirmModal
        open={toDelete !== null}
        message={`¿Eliminar "${toDelete?.title}"?`}
        details={
          activities.length === 1 && event.schedulePublished
            ? "Es la última actividad: el cronograma dejará de mostrarse a los participantes."
            : "También se eliminarán sus premios."
        }
        loading={busy}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />

      <ScheduleModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        activities={activities}
        closeLabel="Cerrar vista previa"
      />
    </div>
  );
}
