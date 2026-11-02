import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../../api";
import ConfirmModal from "../../components/ConfirmModal";
import ParticipantList from "../../components/ParticipantList";
import Spinner from "../../components/Spinner";
import { PHONE_PATTERN } from "../../config/rules";
import useApiData from "../../hooks/useApiData";
import { formatCalendarDate } from "../../utils/date";

export default function ParticipantsPage() {
  const { id } = useParams();
  const { data, error, loading, reload } = useApiData(`/admin/event/${id}/participants`);
  const event = data?.event;
  const participants = data?.participants ?? [];
  const locked = event?.drawDone === true;

  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  // Confirmación genérica: { message, details, confirmLabel, action }
  const [confirm, setConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const add = async (e) => {
    e.preventDefault();
    if (!PHONE_PATTERN.test(phone)) {
      alert("El teléfono debe tener exactamente 9 dígitos");
      return;
    }

    setSaving(true);
    try {
      await api.post("/admin/participant", { eventId: Number(id), phone, firstName, lastName });
      setFirst("");
      setLast("");
      setPhone("");
      reload();
    } catch (err) {
      alert(getErrorMessage(err, "Error agregando participante"));
    } finally {
      setSaving(false);
    }
  };

  const askRemove = (participant) =>
    setConfirm({
      message: `¿Quitar a ${participant.firstName} ${participant.lastName ?? ""} del evento?`,
      details: "También se eliminarán sus opciones de regalo en este evento.",
      confirmLabel: "Sí, quitar",
      action: () => api.delete(`/admin/participant/${participant.id}`),
    });

  const askResetDraw = () =>
    setConfirm({
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
      reload();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setConfirmLoading(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-6 rounded-2xl bg-white shadow-md text-center space-y-3">
        <p className="text-red-600 font-semibold">
          {getErrorMessage(error, "No se pudieron cargar los participantes.")}
        </p>
        <div className="flex justify-center gap-3">
          <button className="btn btn-sm" onClick={reload}>Reintentar</button>
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

  const registeredCount = participants.filter((p) => p.registered).length;
  const withGiftsCount = participants.filter((p) => p.giftsCount > 0).length;

  return (
    <div className="space-y-8 p-4">

      {/* TÍTULO */}
      <div className="text-center space-y-1">
        <h2 className="text-3xl font-extrabold text-green-700">
          🎄 {event.title}
        </h2>
        <p className="text-white/90">
          📅 {event.date_event ? formatCalendarDate(event.date_event) : "Fecha por definir"}
        </p>
        <p className="text-white/90 text-sm">
          👥 {participants.length} participantes · ✅ {registeredCount} registrados · 🎁 {withGiftsCount} con regalos
        </p>
      </div>

      {/* FORMULARIO / BLOQUEO POR SORTEO */}
      {locked ? (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-300 shadow-md max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <p className="text-amber-900">
            🔒 El sorteo ya se realizó. Para agregar o quitar participantes, primero reabre el sorteo.
          </p>
          <button
            onClick={askResetDraw}
            className="px-4 py-2 !bg-amber-500 hover:!bg-amber-600 text-white rounded-lg shadow whitespace-nowrap"
          >
            🔄 Reabrir sorteo
          </button>
        </div>
      ) : (
        <form
          onSubmit={add}
          className="p-6 rounded-2xl bg-white border border-green-200 shadow-md max-w-3xl mx-auto"
        >
          <h3 className="text-xl font-bold text-green-800 mb-4">
            ➕ Agregar nuevo participante
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className="input input-bordered w-full rounded-lg"
              placeholder="Nombre"
              value={firstName}
              onChange={(e) => setFirst(e.target.value)}
              required
              maxLength={100}
            />
            <input
              className="input input-bordered w-full rounded-lg"
              placeholder="Apellido"
              value={lastName}
              onChange={(e) => setLast(e.target.value)}
              maxLength={100}
            />
            <input
              className="input input-bordered w-full rounded-lg"
              placeholder="Teléfono (9 dígitos)"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              required
              maxLength={9}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-4 w-full md:w-auto px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 hover:scale-[1.02] transition shadow-md disabled:opacity-60"
          >
            {saving ? "Agregando..." : "Agregar 🎁"}
          </button>
        </form>
      )}

      {/* LISTA DE PARTICIPANTES */}
      <ParticipantList participants={participants} onRemove={askRemove} locked={locked} />

      <ConfirmModal
        open={confirm !== null}
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
