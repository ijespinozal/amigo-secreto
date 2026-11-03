import { useState } from "react";
import { useParams } from "react-router-dom";
import api, { getErrorMessage } from "../../api";
import ActivityFormModal from "../../components/ActivityFormModal";
import Card from "../../components/Card";
import ConfirmModal from "../../components/ConfirmModal";
import ScheduleModal from "../../components/ScheduleModal";
import PageHeader from "../../components/layout/PageHeader";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";
import { EmptyState, PageError, PageLoading } from "../../components/ui/PageStatus";
import useApiData from "../../hooks/useApiData";
import useDialog from "../../hooks/useDialog";
import { formatCalendarDate } from "../../utils/date";
import { formatScheduleTime, referenceLinkLabel } from "../../utils/schedule";

/** Una actividad en la lista del admin, con sus acciones. */
function ActivityRow({ activity: act, isFirst, isLast, busy, onMove, onEdit, onDelete }) {
  return (
    <li
      aria-label={act.title}
      className="flex items-start gap-3 p-4 bg-white rounded-[var(--radius-card)] border-2 border-gold-400/30 shadow-sm"
    >
      <span
        aria-hidden="true"
        className="w-11 h-11 shrink-0 rounded-full bg-cream-100 border-2 border-gold-400/50 text-xl flex items-center justify-center"
      >
        {act.icon || "⭐"}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="green">⏰ {formatScheduleTime(act.startTime)}</Badge>
          {act.participantsLabel && <Badge tone="gold">👥 {act.participantsLabel}</Badge>}
        </div>
        <p className="font-festive font-bold text-lg text-brand-strong leading-snug mt-1.5 break-words">{act.title}</p>
        {act.description && (
          <p className="text-sm font-semibold text-ink-soft whitespace-pre-line break-words">{act.description}</p>
        )}
        {act.prizes.length > 0 && (
          <p className="text-sm font-semibold text-amber-900 mt-1 break-words">🏆 {act.prizes.join(" · ")}</p>
        )}
        {act.referenceUrl && (
          <a
            href={act.referenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-1 text-sm font-bold text-pine-700 hover:text-pine-800 underline underline-offset-2"
          >
            🎥 {referenceLinkLabel(act.referenceUrl)}
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1.5 shrink-0">
        <IconButton label={`Subir "${act.title}"`} onClick={() => onMove(-1)} disabled={busy || isFirst}>↑</IconButton>
        <IconButton label={`Bajar "${act.title}"`} onClick={() => onMove(1)} disabled={busy || isLast}>↓</IconButton>
        <IconButton label={`Editar "${act.title}"`} onClick={onEdit} disabled={busy}>✏️</IconButton>
        <IconButton label={`Eliminar "${act.title}"`} tone="danger" onClick={onDelete} disabled={busy}>🗑️</IconButton>
      </div>
    </li>
  );
}

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
      <PageError message={getErrorMessage(error, "No se pudo cargar el cronograma.")} onRetry={reload} retrying={loading}>
        <Button variant="secondary" size="sm" to="/admin/dashboard">Volver al panel</Button>
      </PageError>
    );
  }

  if (loading && !data) return <PageLoading />;

  const published = event.schedulePublished;
  const cannotPublish = !published && activities.length === 0;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <PageHeader
        title="Cronograma"
        emoji="📅"
        subtitle={`${event.title} · ${event.date_event ? formatCalendarDate(event.date_event) : "Fecha por definir"}`}
        backTo="/admin/dashboard"
        backLabel="Volver al panel"
      />

      {/* ESTADO Y ACCIONES */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            {published ? (
              <Badge tone="green" className="text-sm">🟢 Publicado: los participantes lo ven</Badge>
            ) : (
              <Badge tone="gray" className="text-sm">⚪ Borrador: solo tú lo ves</Badge>
            )}
            <p className="text-sm font-semibold text-ink-soft mt-2">
              {activities.length === 0
                ? "Si el evento no tendrá cronograma, déjalo vacío: los participantes no verán nada."
                : "Se muestra automáticamente a cada participante la primera vez y cada vez que lo modificas."}
            </p>
          </div>
          <Button
            variant={published ? "neutral" : "primary"}
            onClick={togglePublished}
            disabled={busy || cannotPublish}
            title={cannotPublish ? "Agrega al menos una actividad" : undefined}
            className="shrink-0"
          >
            {published ? "🙈 Ocultar" : "🚀 Publicar"}
          </Button>
        </div>
      </Card>

      {/* ACTIVIDADES */}
      <Card
        title={<><span aria-hidden="true">🗓️</span> Actividades</>}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPreviewOpen(true)} disabled={activities.length === 0}>
              👁️ Vista previa
            </Button>
            <Button variant="gold" size="sm" onClick={() => setEditing(null)}>
              ➕ Agregar actividad
            </Button>
          </div>
        }
      >
        {activities.length === 0 ? (
          <EmptyState icon="🎄" title="Aún no hay actividades">
            Agrega la primera con «➕ Agregar actividad» y publícala cuando esté lista.
          </EmptyState>
        ) : (
          <ol className="flex flex-col gap-3">
            {activities.map((act, index) => (
              <ActivityRow
                key={act.id}
                activity={act}
                isFirst={index === 0}
                isLast={index === activities.length - 1}
                busy={busy}
                onMove={(delta) => move(index, delta)}
                onEdit={() => setEditing(act)}
                onDelete={() => setToDelete(act)}
              />
            ))}
          </ol>
        )}
      </Card>

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
        icon="🗑️"
        message={`¿Eliminar "${toDelete?.title}"?`}
        details={
          activities.length === 1 && published
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
