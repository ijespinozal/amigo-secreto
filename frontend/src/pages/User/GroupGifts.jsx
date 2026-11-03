import { useState } from "react";
import { getErrorMessage } from "../../api";
import Spinner from "../../components/Spinner";
import useApiData from "../../hooks/useApiData";
import useEvents from "../../hooks/useEvents";
import useRequireEvent from "../../hooks/useRequireEvent";

/** Normaliza para buscar sin importar mayúsculas ni tildes ("maria" encuentra "María"). */
const normalize = (text) =>
  (text ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Opciones de regalo de los demás participantes del evento seleccionado. */
export default function GroupGifts() {
  const { ready, selectedEventId, error: eventsError, reload: reloadEvents } = useEvents();
  const hasEvent = ready && selectedEventId !== null;
  const { data, error, loading, reload } = useApiData("/user/group-gifts", {
    enabled: hasEvent,
    scope: selectedEventId,
  });
  const [query, setQuery] = useState("");
  const redirectingNoEvent = useRequireEvent();

  // Sin evento: vuelve al inicio con el aviso (mientras tanto, "cargando").
  if (!ready || redirectingNoEvent || (hasEvent && !data && !error)) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spinner size="lg" />
      </div>
    );
  }

  if (eventsError || error) {
    return (
      <div className="alert alert-error shadow-md flex flex-wrap items-center justify-between gap-2 text-lg mt-4">
        <span>⚠️ {getErrorMessage(error, "No pudimos cargar las opciones de regalo del grupo.")}</span>
        {/* index.css estiliza todos los <button>: se limita el ancho */}
        <button className="btn btn-sm !w-auto" onClick={eventsError ? () => reloadEvents().catch(() => {}) : reload} disabled={loading}>
          Reintentar
        </button>
      </div>
    );
  }

  const participants = data.participants;
  const withGifts = participants.filter((p) => p.gifts.length > 0).length;
  const search = normalize(query.trim());
  const visible = search
    ? participants.filter((p) => normalize(`${p.firstName} ${p.lastName}`).includes(search))
    : participants;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          👀 Opciones de regalo del grupo
        </h2>
        <p className="text-white/90">
          {participants.length === 0
            ? "Aún no hay otros participantes en este evento."
            : `${withGifts} de ${participants.length} participantes ya registraron sus opciones.`}
        </p>
      </div>

      {participants.length > 0 && (
        <input
          type="search"
          className="input input-bordered w-full md:max-w-sm rounded-lg bg-white"
          placeholder="🔍 Buscar por nombre..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar participante"
        />
      )}

      {search && visible.length === 0 && (
        <p className="text-white/90">No hay participantes que coincidan con “{query}”.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visible.map((p) => (
          <article
            key={p.id}
            className="p-5 rounded-2xl bg-white/90 shadow-md border border-red-200/40"
            aria-label={`${p.firstName} ${p.lastName ?? ""}`}
          >
            <h3 className="text-lg font-bold text-red-700 flex items-center justify-between gap-2">
              <span>🎁 {p.firstName} {p.lastName}</span>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600 shrink-0">
                {p.gifts.length} {p.gifts.length === 1 ? "opción" : "opciones"}
              </span>
            </h3>

            {p.gifts.length === 0 ? (
              <p className="text-sm text-gray-500 mt-3">
                {p.registered ? "Aún no registra opciones de regalo." : "Aún no crea su cuenta."}
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {p.gifts.map((g) => (
                  <li key={g.id} className="p-3 rounded-lg bg-base-200 bg-gray-50">
                    <strong className="block text-gray-800 break-words">{g.title}</strong>
                    {g.note && <p className="text-sm text-gray-600 break-words">{g.note}</p>}
                    {g.link && (
                      <a
                        href={g.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-700 underline"
                      >
                        Ver link del regalo
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
