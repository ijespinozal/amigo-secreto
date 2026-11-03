import { useState } from "react";
import { getErrorMessage } from "../../api";
import Card from "../../components/Card";
import GiftItem from "../../components/gifts/GiftItem";
import PageHeader from "../../components/layout/PageHeader";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import { EmptyState, PageError, PageLoading } from "../../components/ui/PageStatus";
import TextField from "../../components/ui/TextField";
import useApiData from "../../hooks/useApiData";
import useEvents from "../../hooks/useEvents";
import useRequireEvent from "../../hooks/useRequireEvent";

/** Normaliza para buscar sin importar mayúsculas ni tildes ("maria" encuentra "María"). */
const normalize = (text) =>
  (text ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const fullNameOf = (p) => `${p.firstName} ${p.lastName ?? ""}`.trim();

/** Primero quien tiene más opciones; a igual cantidad, por nombre. */
const byGiftsThenName = (a, b) =>
  b.gifts.length - a.gifts.length || fullNameOf(a).localeCompare(fullNameOf(b), "es");

/** Tarjeta de un participante con sus opciones de regalo. */
function ParticipantGifts({ participant: p }) {
  const fullName = fullNameOf(p);
  return (
    <Card>
      <article aria-label={fullName}>
        <header className="flex items-center gap-3">
          <Avatar firstName={p.firstName} lastName={p.lastName} />
          <h2 className="min-w-0 flex-1 font-festive font-bold text-lg text-brand-strong leading-snug break-words">{fullName}</h2>
          <Badge tone="gold">
            {p.gifts.length} {p.gifts.length === 1 ? "opción" : "opciones"}
          </Badge>
        </header>
        <ul className="mt-4 flex flex-col gap-2.5">
          {p.gifts.map((g, index) => (
            <GiftItem key={g.id} gift={g} position={index + 1} />
          ))}
        </ul>
      </article>
    </Card>
  );
}

/** Quienes aún no tienen opciones, agrupados en una sola tarjeta compacta. */
function PendingParticipants({ participants }) {
  return (
    <Card
      title={<><span aria-hidden="true">⏳</span> Aún sin opciones</>}
      actions={<Badge tone="gray">{participants.length}</Badge>}
    >
      <ul className="flex flex-wrap gap-2.5" aria-label="Participantes sin opciones de regalo">
        {participants.map((p) => (
          <li
            key={p.id}
            aria-label={fullNameOf(p)}
            className="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full bg-white border-2 border-gold-400/30 shadow-sm"
          >
            <Avatar firstName={p.firstName} lastName={p.lastName} size="sm" />
            <span className="leading-tight">
              <span className="block font-festive font-bold text-brand-strong">{fullNameOf(p)}</span>
              <span className="block text-xs font-semibold text-ink-soft">
                {p.registered ? "Aún no registra opciones" : "Aún no crea su cuenta"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** Opciones de regalo de los demás participantes del evento seleccionado. */
export default function GroupGifts() {
  const { ready, selectedEvent, selectedEventId, error: eventsError, reload: reloadEvents } = useEvents();
  const hasEvent = ready && selectedEventId !== null;
  const { data, error, loading, reload } = useApiData("/user/group-gifts", {
    enabled: hasEvent,
    scope: selectedEventId,
  });
  const [query, setQuery] = useState("");
  const redirectingNoEvent = useRequireEvent();

  // Sin evento: vuelve al inicio con el aviso (mientras tanto, "cargando").
  if (!ready || redirectingNoEvent || (hasEvent && !data && !error && !eventsError)) {
    return <PageLoading />;
  }

  if (eventsError || error) {
    return (
      <PageError
        message={getErrorMessage(error, "No pudimos cargar las opciones de regalo del grupo.")}
        onRetry={eventsError ? () => reloadEvents().catch(() => {}) : reload}
        retrying={loading}
      />
    );
  }

  const participants = data.participants;
  const withGifts = participants.filter((p) => p.gifts.length > 0).length;
  const search = normalize(query.trim());
  const visible = search
    ? participants.filter((p) => normalize(`${p.firstName} ${p.lastName}`).includes(search))
    : participants;
  const withOptions = visible.filter((p) => p.gifts.length > 0).sort(byGiftsThenName);
  const pending = visible.filter((p) => p.gifts.length === 0);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <PageHeader
        title="Regalos del grupo"
        emoji="👀"
        subtitle={`${selectedEvent?.title ?? ""} · Inspírate con las ideas de los demás participantes.`}
      >
        {participants.length > 0 && (
          <Badge tone="cream" className="text-sm">
            {withGifts} de {participants.length} ya registraron sus opciones
          </Badge>
        )}
      </PageHeader>

      {participants.length === 0 ? (
        <Card className="max-w-xl mx-auto">
          <EmptyState icon="🎄" title="Aún no hay otros participantes">
            Cuando el administrador agregue más personas al evento, verás aquí sus ideas de regalo.
          </EmptyState>
        </Card>
      ) : (
        <>
          <TextField
            type="search"
            icon="🔍"
            className="w-full sm:max-w-sm"
            placeholder="Buscar por nombre..."
            aria-label="Buscar participante"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {visible.length === 0 ? (
            <Card className="max-w-xl mx-auto">
              <EmptyState icon="🔍" title="Sin resultados">
                No hay participantes que coincidan con “{query}”.
              </EmptyState>
            </Card>
          ) : (
            <>
              {/* Sin items-start: las tarjetas de una misma fila comparten altura. */}
              {withOptions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {withOptions.map((p) => (
                    <ParticipantGifts key={p.id} participant={p} />
                  ))}
                </div>
              )}
              {pending.length > 0 && <PendingParticipants participants={pending} />}
            </>
          )}
        </>
      )}
    </div>
  );
}
