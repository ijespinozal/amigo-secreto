import { useState } from "react";
import api, { getErrorMessage } from "../../api";
import AlertMessage from "../../components/AlertMessage";
import Card from "../../components/Card";
import ConfirmModal from "../../components/ConfirmModal";
import EditGiftModal from "../../components/EditGiftModal";
import GiftForm from "../../components/GiftForm";
import Spinner from "../../components/Spinner";
import GiftItem from "../../components/gifts/GiftItem";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
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
  if (!ready || redirectingNoEvent) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spinner size="lg" />
      </div>
    );
  }

  if (eventsError) {
    return (
      <Card className="max-w-xl mx-auto text-center">
        <p className="font-semibold text-red-700">⚠️ No pudimos cargar tus eventos. Revisa tu conexión e inténtalo de nuevo.</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => reloadEvents().catch(() => {})}>Reintentar</Button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {toast && <AlertMessage type="success" message={toast} onClose={() => setToast(null)} />}

      {/* ENCABEZADO */}
      <section>
        <Button to="/user/home" variant="ghost" size="sm" className="text-on-page hover:bg-white/10 -ml-3">
          ← Volver a Mi espacio
        </Button>
        <h1 className="font-festive font-bold text-3xl sm:text-4xl text-on-page drop-shadow-md tracking-tight mt-1">
          Mis opciones de regalo <span aria-hidden="true">🎁</span>
        </h1>
        <p className="font-semibold text-on-page/90 mt-1">
          {selectedEvent?.title} · Cuéntale a tu amigo secreto qué te gustaría recibir.
        </p>
        <div className="mt-3">
          <GiftProgress count={gifts.length} />
        </div>
      </section>

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
            <div className="text-center py-6">
              <div aria-hidden="true" className="text-5xl mb-2">🎄</div>
              <p className="font-festive font-bold text-lg text-brand-strong">Aún no agregaste opciones</p>
              <p className="text-sm font-semibold text-ink-soft mt-1">
                Registra hasta {MAX_GIFTS_PER_PARTICIPANT} ideas para que tu amigo secreto acierte.
              </p>
            </div>
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
