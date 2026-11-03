import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getErrorCode } from "../../api";
import Card from "../../components/Card";
import Spinner from "../../components/Spinner";
import useApiData from "../../hooks/useApiData";
import useDialog from "../../hooks/useDialog";
import useRequireEvent from "../../hooks/useRequireEvent";
import { NOT_DRAWN_DIALOG } from "../../config/messages";
import useEvents from "../../hooks/useEvents";

const NotParticipant = () => (
  <div className="alert alert-info shadow-md flex items-center gap-2 text-lg mt-4">
    🎄 Aún no perteneces a ningún evento. Comunícate con el administrador para que te agregue.
  </div>
);

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

  // 🌟 CARGANDO (o redirigiendo)
  if (!ready || redirectingNoEvent || notDrawnYet || (selectedEventId !== null && !secret && !error)) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spinner size="lg" />
      </div>
    );
  }

  // 🌟 YA NO PERTENECE AL EVENTO (p. ej. el admin lo quitó con la pantalla abierta)
  if (getErrorCode(error) === "NOT_PARTICIPANT") {
    return <NotParticipant />;
  }

  // 🌟 ERROR DEL SERVIDOR / CONEXIÓN
  if (error || eventsError) {
    return (
      <div className="alert alert-error shadow-md flex flex-wrap items-center justify-between gap-2 text-lg mt-4">
        <span>⚠️ No pudimos cargar tu amigo secreto. Revisa tu conexión e inténtalo de nuevo.</span>
        <button className="btn btn-sm" onClick={eventsError ? () => reloadEvents().catch(() => {}) : reload} disabled={loading}>
          {loading ? "Reintentando..." : "Reintentar"}
        </button>
      </div>
    );
  }

  // 🌟 SI HAY AMIGO SECRETO MOSTRARLO
  return (
    <div className="animate-fadeIn relative">
      <Card title="🎁 Tu amigo secreto">
        <div className="space-y-3">

          {/* Datos del amigo secreto */}
          <div className="bg-base-200 p-4 rounded shadow-inner">
            <p className="font-bold text-xl">
              {secret.friend.firstName} {secret.friend.lastName}
            </p>
            <p className="text-sm opacity-80">
              {secret.friend.phone}
              {secret.friend.email && ` • ${secret.friend.email}`}
            </p>
          </div>

          <h3 className="mt-4 font-semibold text-green-700 text-lg">
            📋 Sus opciones de regalo
          </h3>

          {/* Lista de regalos */}
          {secret.gifts.length === 0 ? (
            <p className="text-sm opacity-70">Tu amigo secreto aún no registró opciones de regalo.</p>
          ) : (
            <div className="space-y-2">
              {secret.gifts.map(g => (
                <div
                  key={g.id}
                  className="p-3 bg-base-200 rounded shadow hover:bg-base-300 transition"
                >
                  <strong className="block text-lg">{g.title}</strong>
                  <p className="text-sm">{g.note}</p>

                  {g.link && (
                    <a
                      href={g.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary text-sm underline"
                    >
                      Ver link
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </Card>
    </div>
  );
}
