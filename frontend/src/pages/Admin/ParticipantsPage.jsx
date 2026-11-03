import { useState } from "react";
import { useParams } from "react-router-dom";
import api, { getErrorMessage } from "../../api";
import Card from "../../components/Card";
import ConfirmModal from "../../components/ConfirmModal";
import ParticipantList from "../../components/ParticipantList";
import Spinner from "../../components/Spinner";
import ManualParticipantForm from "../../components/admin/ManualParticipantForm";
import StatCard from "../../components/admin/StatCard";
import UserPicker from "../../components/admin/UserPicker";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import useApiData from "../../hooks/useApiData";
import useDialog from "../../hooks/useDialog";
import { formatCalendarDate } from "../../utils/date";

const plural = (n, singular, pluralForm) => `${n} ${n === 1 ? singular : pluralForm}`;

/** Resumen legible del alta múltiple. */
const describeBulkResult = ({ added, linked, skipped }) =>
  [
    added && `${plural(added, "participante agregado", "participantes agregados")}.`,
    linked && `${plural(linked, "participante sin cuenta quedó vinculado", "participantes sin cuenta quedaron vinculados")} a su cuenta.`,
    skipped && `${plural(skipped, "ya estaba", "ya estaban")} en el evento.`,
  ]
    .filter(Boolean)
    .join(" ");

export default function ParticipantsPage() {
  const { id } = useParams();
  const dialog = useDialog();
  const { data, error, loading, reload } = useApiData(`/admin/event/${id}/participants`);
  const event = data?.event;
  const participants = data?.participants ?? [];
  const locked = event?.drawDone === true;

  // Cambia cada vez que la lista se modifica: refresca los candidatos del buscador.
  const [version, setVersion] = useState(0);
  const refresh = () => {
    reload();
    setVersion((v) => v + 1);
  };

  // Confirmación genérica: { icon, message, details, confirmLabel, tone, action }
  const [confirm, setConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showError = (err, title = "No se pudo completar") =>
    dialog.alert({ type: "error", title, message: getErrorMessage(err) });

  const askRemove = (participant) =>
    setConfirm({
      icon: "🗑️",
      message: `¿Quitar a ${participant.firstName} ${participant.lastName ?? ""} del evento?`,
      details: "También se eliminarán sus opciones de regalo en este evento.",
      confirmLabel: "Sí, quitar",
      action: () => api.delete(`/admin/participant/${participant.id}`),
    });

  const askResetDraw = () =>
    setConfirm({
      icon: "🔄",
      message: "¿Reabrir el sorteo?",
      details: "Se borrarán las asignaciones actuales. Si alguien ya vio a su amigo secreto, al volver a sortear le puede tocar otra persona.",
      confirmLabel: "Sí, reabrir",
      action: () => api.post(`/admin/event/${id}/reset-draw`),
    });

  const runConfirmed = async () => {
    setConfirmLoading(true);
    try {
      await confirm.action();
      setConfirm(null);
      refresh();
    } catch (err) {
      setConfirm(null);
      showError(err);
    } finally {
      setConfirmLoading(false);
    }
  };

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto text-center">
        <p className="font-semibold text-red-700">{getErrorMessage(error, "No se pudieron cargar los participantes.")}</p>
        <div className="flex justify-center gap-3 mt-4">
          <Button variant="secondary" size="sm" onClick={reload}>Reintentar</Button>
          <Button variant="secondary" size="sm" to="/admin/dashboard">Volver al panel</Button>
        </div>
      </Card>
    );
  }

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spinner size="lg" />
      </div>
    );
  }

  const registeredCount = participants.filter((p) => p.registered).length;
  const withGiftsCount = participants.filter((p) => p.giftsCount > 0).length;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">

      {/* ENCABEZADO */}
      <section className="flex flex-col gap-5">
        <div>
          <Button to="/admin/dashboard" variant="ghost" size="sm" className="text-on-page hover:bg-white/10 -ml-3">
            ← Volver al panel
          </Button>
          <h1 className="font-festive font-bold text-3xl sm:text-4xl text-on-page drop-shadow-md tracking-tight mt-1">
            Participantes <span aria-hidden="true">🎄</span>
          </h1>
          <p className="font-festive font-medium text-lg text-on-page-accent">
            {event.title} · {event.date_event ? formatCalendarDate(event.date_event) : "Fecha por definir"}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl">
          <StatCard icon="👥" value={participants.length} label="Participantes" />
          <StatCard icon="✅" value={registeredCount} label="Registrados" />
          <StatCard icon="🎁" value={withGiftsCount} label="Con regalos" />
        </div>
      </section>

      {/* AGREGAR / BLOQUEO POR SORTEO */}
      {locked ? (
        <section className="p-5 rounded-[var(--radius-panel)] bg-amber-50 border-2 border-amber-300 shadow-[var(--shadow-cozy)] flex flex-wrap items-center justify-between gap-4">
          <p className="font-semibold text-amber-900 flex-1 min-w-[220px]">
            <span aria-hidden="true">🔒</span> El sorteo ya se realizó. Para agregar o quitar participantes, primero reabre el sorteo.
          </p>
          <Button variant="warning" onClick={askResetDraw}>
            <span aria-hidden="true">🔄</span> Reabrir sorteo
          </Button>
        </section>
      ) : (
        <Card title={<><span aria-hidden="true">➕</span> Agregar participantes</>}>
          <div className="flex flex-col gap-5">
            <UserPicker
              eventId={id}
              refreshKey={version}
              onAdded={(result) => {
                refresh();
                dialog.alert({ type: "success", title: "¡Participantes agregados!", message: describeBulkResult(result) });
              }}
              onError={(err) => showError(err, "No se pudieron agregar")}
            />
            <ManualParticipantForm
              eventId={id}
              onAdded={(participant) => {
                refresh();
                dialog.alert({
                  type: "success",
                  title: "¡Participante agregado!",
                  message: participant.userId
                    ? `${participant.firstName} ${participant.lastName ?? ""} ya tenía cuenta: quedó vinculado con sus datos registrados.`
                    : `${participant.firstName} quedará vinculado cuando se registre con el teléfono ${participant.phone}.`,
                });
              }}
              onError={(err) => showError(err, "No se pudo agregar")}
            />
          </div>
        </Card>
      )}

      {/* LISTA */}
      <Card
        title={<><span aria-hidden="true">🎁</span> En este evento</>}
        actions={participants.length > 0 && <Badge tone="gold">{plural(participants.length, "participante", "participantes")}</Badge>}
      >
        <ParticipantList participants={participants} onRemove={askRemove} locked={locked} />
      </Card>

      <ConfirmModal
        open={confirm !== null}
        icon={confirm?.icon}
        message={confirm?.message}
        details={confirm?.details}
        confirmLabel={confirm?.confirmLabel}
        loading={confirmLoading}
        onConfirm={runConfirmed}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
