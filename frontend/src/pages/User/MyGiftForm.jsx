import { useState } from "react";
import api, { getErrorMessage } from "../../api";
import AlertMessage from "../../components/AlertMessage";
import Card from "../../components/Card";
import ConfirmModal from "../../components/ConfirmModal";
import EditGiftModal from "../../components/EditGiftModal";
import GiftForm from "../../components/GiftForm";
import GiftItem from "../../components/gifts/GiftItem";
import PageHeader from "../../components/layout/PageHeader";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { EmptyState, PageError, PageLoading } from "../../components/ui/PageStatus";
import { MAX_GIFTS_PER_PARTICIPANT } from "../../config/rules";
import useApiData from "../../hooks/useApiData";
import useDialog from "../../hooks/useDialog";
import useEvents from "../../hooks/useEvents";
import useRequireEvent from "../../hooks/useRequireEvent";

/** Progreso visual: un punto por opción (●●○). */
function GiftProgress({ count }) {
  return (
    <div className="flex items-center gap-2" aria-label={`${count} de ${MAX_GIFTS_PER_PARTICIPANT} opciones registradas`}>
      <div className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: MAX_GIFTS_PER_PARTICIPANT }, (_, i) => (
          <span key={i} className={`w-3 h-3 rounded-full ${i < count ? "bg-gold-400" : "bg-white/25"}`} />
        ))}
      </div>
      <span className="font-festive font-semibold text-on-page-accent">
        {count} de {MAX_GIFTS_PER_PARTICIPANT} opciones
      </span>
    </div>
  );
}

export default function MyGiftForm() {
  const { ready, selectedEvent, selectedEventId, error: eventsError, reload: reloadEvents } = useEvents();
  const hasEvent = ready && selectedEventId !== null;
  const redirectingNoEvent = useRequireEvent();
  const dialog = useDialog();

  const { data, error, reload } = useApiData("/user/gifts", { enabled: hasEvent, scope: selectedEventId });
  const gifts = data ?? [];

  const [toast, setToast] = useState(null);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showError = (err, title) => dialog.alert({ type: "error", title, message: getErrorMessage(err) });

  const saveEdit = async (values) => {
    try {
      await api.put(`/user/gift/${editing.id}`, values);
      setEditing(null);
      reload();
      setToast("🎄 ¡Opción actualizada!");
    } catch (err) {
      showError(err, "No se pudo actualizar");
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/user/gift/${toDelete.id}`);
      setToDelete(null);
      reload();
      setToast("Opción eliminada.");
    } catch (err) {
      setToDelete(null);
      showError(err, "No se pudo eliminar");
    } finally {
      setDeleting(false);
    }
  };

  // Sin evento: vuelve al inicio con el aviso (mientras tanto, "cargando").
  if (!ready || redirectingNoEvent) return <PageLoading />;

  if (eventsError) {
    return (
      <PageError
        message="No pudimos cargar tus eventos. Revisa tu conexión e inténtalo de nuevo."
        onRetry={() => reloadEvents().catch(() => {})}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {toast && <AlertMessage type="success" message={toast} onClose={() => setToast(null)} />}

      <PageHeader
        title="Mis opciones de regalo"
        emoji="🎁"
        subtitle={`${selectedEvent?.title ?? ""} · Cuéntale a tu amigo secreto qué te gustaría recibir.`}
      >
        <GiftProgress count={gifts.length} />
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ALTA */}
        <Card title={<><span aria-hidden="true">➕</span> Agregar nueva opción</>}>
          <GiftForm
            giftsCount={gifts.length}
            onAdded={() => {
              reload();
              setToast("🎁 ¡Opción guardada!");
            }}
            onError={(err) => showError(err, "No se pudo guardar")}
          />
        </Card>

        {/* LISTA (en celular va primero: lo más consultado es lo ya registrado) */}
        <Card
          className="order-first lg:order-none"
          title={<><span aria-hidden="true">📋</span> Tus opciones registradas</>}
          actions={<Badge tone="gold">{gifts.length}/{MAX_GIFTS_PER_PARTICIPANT}</Badge>}
        >
          {error ? (
            <div className="text-center space-y-3">
              <p className="font-semibold text-red-700">{getErrorMessage(error, "No pudimos cargar tus opciones.")}</p>
              <Button variant="secondary" size="sm" onClick={reload}>Reintentar</Button>
            </div>
          ) : gifts.length === 0 ? (
            <EmptyState icon="🎄" title="Aún no agregaste opciones">
              Registra hasta {MAX_GIFTS_PER_PARTICIPANT} ideas para que tu amigo secreto acierte.
            </EmptyState>
          ) : (
            <ul className="flex flex-col gap-3">
              {gifts.map((g, index) => (
                <GiftItem
                  key={g.id}
                  gift={g}
                  position={index + 1}
                  onEdit={() => setEditing(g)}
                  onDelete={() => setToDelete(g)}
                />
              ))}
            </ul>
          )}
        </Card>
      </div>

      {editing && (
        <EditGiftModal key={editing.id} gift={editing} onSave={saveEdit} onClose={() => setEditing(null)} />
      )}

      <ConfirmModal
        open={toDelete !== null}
        icon="🗑️"
        message={`¿Eliminar "${toDelete?.title}"?`}
        details="Tu amigo secreto ya no verá esta opción."
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
