import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getErrorCode } from "../../api";
import Card from "../../components/Card";
import GiftItem from "../../components/gifts/GiftItem";
import PageHeader from "../../components/layout/PageHeader";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { EmptyState, PageError, PageLoading } from "../../components/ui/PageStatus";
import { NOT_DRAWN_DIALOG } from "../../config/messages";
import useApiData from "../../hooks/useApiData";
import useDialog from "../../hooks/useDialog";
import useEvents from "../../hooks/useEvents";
import useRequireEvent from "../../hooks/useRequireEvent";
import { daysUntil, formatCalendarDate } from "../../utils/date";

/** "987654321" -> "987 654 321" */
const formatPhone = (phone = "") => phone.replace(/^(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3");

/** Texto corto de cuánto falta para el intercambio. */
const exchangeLabel = (dateEvent) => {
  const days = daysUntil(dateEvent);
  if (days === null) return null;
  const date = formatCalendarDate(dateEvent, { day: "numeric", month: "long" });
  if (days > 1) return `Intercambio el ${date} · faltan ${days} días`;
  if (days === 1) return `Intercambio mañana, ${date}`;
  if (days === 0) return "¡El intercambio es hoy!";
  return `El intercambio fue el ${date}`;
};

export default function MySecret() {
  const { ready, selectedEventId, error: eventsError, reload: reloadEvents } = useEvents();
  const { data: secret, error, loading, reload } = useApiData("/user/secret-friend", {
    enabled: ready && selectedEventId !== null,
    scope: selectedEventId,
  });
  const navigate = useNavigate();
  const dialog = useDialog();
  const redirectingNoEvent = useRequireEvent();

  // Antes del sorteo esta pantalla no aplica (p. ej. si se entra por URL):
  // se vuelve al inicio con el aviso. El ref evita el aviso duplicado del
  // doble montaje de StrictMode en desarrollo.
  const notDrawnYet = secret?.revealed === false;
  const redirectedRef = useRef(false);
  useEffect(() => {
    if (!notDrawnYet || redirectedRef.current) return;
    redirectedRef.current = true;
    navigate("/user/home", { replace: true });
    dialog.alert(NOT_DRAWN_DIALOG);
  }, [notDrawnYet, navigate, dialog]);

  // Cargando (o redirigiendo)
  if (!ready || redirectingNoEvent || notDrawnYet || (selectedEventId !== null && !secret && !error && !eventsError)) {
    return <PageLoading />;
  }

  // Ya no pertenece al evento (p. ej. el admin lo quitó con la pantalla abierta)
  if (getErrorCode(error) === "NOT_PARTICIPANT") {
    return (
      <Card className="max-w-xl mx-auto">
        <EmptyState icon="🎄" title="Ya no participas en este evento">
          Comunícate con el administrador si crees que es un error.
        </EmptyState>
        <div className="text-center">
          <Button to="/user/home" variant="secondary" size="sm">Volver a Mi espacio</Button>
        </div>
      </Card>
    );
  }

  if (error || eventsError) {
    return (
      <PageError
        message="No pudimos cargar tu amigo secreto. Revisa tu conexión e inténtalo de nuevo."
        onRetry={eventsError ? () => reloadEvents().catch(() => {}) : reload}
        retrying={loading}
      />
    );
  }

  const { friend, gifts, event } = secret;
  const fullName = `${friend.firstName} ${friend.lastName ?? ""}`.trim();
  const when = exchangeLabel(event?.date_event);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <PageHeader title="Tu amigo secreto" emoji="🤫" subtitle={event?.title} />

      {/* Las dos tarjetas comparten altura (stretch) y centran su contenido. */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* REVELACIÓN */}
        <Card className="lg:col-span-2 text-center relative overflow-hidden flex flex-col justify-center">
          <div aria-hidden="true" className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gold-400/20" />
          <p className="font-festive font-bold text-sm uppercase tracking-widest text-ink-soft">Este año le regalas a</p>

          <div className="flex justify-center mt-4">
            <Avatar firstName={friend.firstName} lastName={friend.lastName} size="xl" className="ring-4 ring-gold-400/50" />
          </div>
          <h2 className="font-festive font-bold text-3xl text-brand-strong mt-3 break-words">{fullName}</h2>

          {(friend.phone || friend.email) && (
            <div className="mt-2 text-sm font-semibold text-ink-soft space-y-0.5 break-words">
              {friend.phone && <p>📞 {formatPhone(friend.phone)}</p>}
              {friend.email && <p>✉️ {friend.email}</p>}
            </div>
          )}

          {when && (
            <div className="mt-4">
              <Badge tone="green">🗓️ {when}</Badge>
            </div>
          )}

          <p className="mt-5 text-sm font-bold text-brand bg-brand-soft rounded-xl px-4 py-3">
            🤫 ¡Shhh! Que no se entere hasta el intercambio.
          </p>
        </Card>

        {/* OPCIONES DE REGALO */}
        <Card
          className="lg:col-span-3 flex flex-col"
          title={<><span aria-hidden="true">🎁</span> Sus opciones de regalo</>}
          actions={<Badge tone="gold">{gifts.length} {gifts.length === 1 ? "opción" : "opciones"}</Badge>}
        >
          {gifts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState icon="⏳" title={`${friend.firstName} aún no registró opciones`}>
                Vuelve más tarde: cuando agregue sus ideas de regalo, aparecerán aquí.
              </EmptyState>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {gifts.map((g, index) => (
                <GiftItem key={g.id} gift={g} position={index + 1} />
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
