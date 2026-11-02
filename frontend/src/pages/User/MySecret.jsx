import { getErrorCode } from "../../api";
import Card from "../../components/Card";
import Spinner from "../../components/Spinner";
import useApiData from "../../hooks/useApiData";
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

  // 🌟 CARGANDO
  if (!ready || (selectedEventId !== null && !secret && !error)) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spinner size="lg" />
      </div>
    );
  }

  // 🌟 NO PERTENECE A NINGÚN EVENTO
  if ((!eventsError && selectedEventId === null) || getErrorCode(error) === "NOT_PARTICIPANT") {
    return <NotParticipant />;
  }

  // 🌟 ERROR DEL SERVIDOR / CONEXIÓN
  if (error || eventsError) {
    return (
      <div className="alert alert-error shadow-md flex flex-wrap items-center justify-between gap-2 text-lg mt-4">
        <span>⚠️ No pudimos cargar tu amigo secreto. Revisa tu conexión e inténtalo de nuevo.</span>
        <button className="btn btn-sm" onClick={eventsError ? reloadEvents : reload} disabled={loading}>
          {loading ? "Reintentando..." : "Reintentar"}
        </button>
      </div>
    );
  }

  // 🌟 AÚN NO HAY SORTEO
  if (!secret.revealed) {
    return (
      <div className="alert alert-warning shadow-md flex items-center gap-2 text-lg mt-4">
        🎅 A la espera del sorteo... Te avisaremos aquí cuando tu amigo secreto esté listo.
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
