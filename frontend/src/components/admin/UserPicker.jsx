import { useState } from "react";
import api, { getErrorMessage } from "../../api";
import useApiData from "../../hooks/useApiData";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import TextField from "../ui/TextField";

/**
 * Buscador de usuarios registrados para agregarlos al evento sin tipear sus
 * datos. Selección múltiple: se conserva aunque cambie la búsqueda.
 * @param {(result: { added, linked, skipped }) => void} onAdded
 * @param {(error) => void} onError
 * @param {number} [refreshKey] cambia cuando la lista de participantes cambia
 *   desde fuera (p. ej. al quitar a alguien vuelve a ser candidato)
 */
export default function UserPicker({ eventId, onAdded, onError, refreshKey = 0 }) {
  const [query, setQuery] = useState("");
  const search = useDebouncedValue(query.trim(), 300);
  const { data, error, loading, reload } = useApiData(
    `/admin/event/${eventId}/candidates?q=${encodeURIComponent(search)}`,
    { scope: refreshKey }
  );
  const candidates = data?.users ?? [];

  // id -> usuario (para mostrar los chips aunque ya no estén en los resultados)
  const [selected, setSelected] = useState(new Map());
  const [adding, setAdding] = useState(false);

  const toggle = (user) =>
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(user.id)) next.delete(user.id);
      else next.set(user.id, user);
      return next;
    });

  const allVisibleSelected = candidates.length > 0 && candidates.every((u) => selected.has(u.id));
  const toggleAllVisible = () =>
    setSelected((prev) => {
      const next = new Map(prev);
      candidates.forEach((u) => (allVisibleSelected ? next.delete(u.id) : next.set(u.id, u)));
      return next;
    });

  const addSelected = async () => {
    setAdding(true);
    try {
      const res = await api.post(`/admin/event/${eventId}/participants/bulk`, { userIds: [...selected.keys()] });
      setSelected(new Map());
      setQuery("");
      reload();
      onAdded(res.data);
    } catch (err) {
      onError(err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Buscar usuario registrado"
        type="search"
        icon={<span className="text-lg">🔍</span>}
        placeholder="Nombre, apellido o teléfono"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        maxLength={100}
        hint="Los datos se toman de la cuenta de cada persona: sin errores de tipeo."
      />

      {/* Seleccionados */}
      {selected.size > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Usuarios seleccionados">
          {[...selected.values()].map((u) => (
            <span key={u.id} className="inline-flex items-center gap-1.5 pl-1 pr-1 py-1 rounded-full bg-pine-700 text-white text-sm font-bold">
              <Avatar firstName={u.firstName} lastName={u.lastName} size="sm" className="w-6 h-6 text-[10px]" />
              {u.firstName} {u.lastName}
              <button
                type="button"
                onClick={() => toggle(u)}
                aria-label={`Quitar a ${u.firstName} de la selección`}
                className="w-6 h-6 p-0 rounded-full bg-white/15 hover:bg-white/30 text-white text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Resultados */}
      <div className="rounded-[var(--radius-card)] border-2 border-gold-400/30 bg-white overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-cream-50 border-b border-gold-400/20 text-sm font-bold text-ink-soft">
          <span aria-live="polite">
            {loading ? "Buscando..." : `${data?.total ?? 0} disponible${data?.total === 1 ? "" : "s"}`}
          </span>
          {candidates.length > 1 && (
            <button type="button" onClick={toggleAllVisible} className="w-auto p-0 bg-transparent text-pine-700 hover:underline font-bold">
              {allVisibleSelected ? "Quitar todos" : "Seleccionar todos"}
            </button>
          )}
        </div>

        {error ? (
          <div className="p-4 text-center text-sm font-semibold text-red-700 space-y-2">
            <p>{getErrorMessage(error, "No se pudo buscar usuarios.")}</p>
            <Button variant="secondary" size="sm" onClick={reload}>Reintentar</Button>
          </div>
        ) : !loading && candidates.length === 0 ? (
          <p className="p-5 text-center text-sm font-semibold text-ink-soft">
            {search ? `No encontramos usuarios disponibles con “${search}”.` : "🎉 Todos los usuarios registrados ya están en este evento."}
          </p>
        ) : (
          <ul className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-gold-400/15">
            {candidates.map((u) => {
              const checked = selected.has(u.id);
              return (
                <li key={u.id}>
                  <label className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${checked ? "bg-emerald-50" : "hover:bg-cream-50"}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(u)}
                      className="w-5 h-5 p-0 m-0 shrink-0 accent-pine-700 cursor-pointer"
                    />
                    <Avatar firstName={u.firstName} lastName={u.lastName} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-festive font-bold text-brand-strong truncate">{u.firstName} {u.lastName}</span>
                      <span className="block text-xs font-semibold text-ink-soft tabular-nums">{u.phone}</span>
                    </span>
                    {u.role === "admin" && <Badge tone="brand">Admin</Badge>}
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        {data && data.total > candidates.length && (
          <p className="px-4 py-2 text-xs font-semibold text-stone-500 border-t border-gold-400/20">
            Mostrando {candidates.length} de {data.total}. Escribe para refinar la búsqueda.
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={addSelected} disabled={selected.size === 0 || adding} className="w-full sm:w-auto">
          {adding
            ? "Agregando..."
            : selected.size === 0
              ? "Selecciona a quién agregar"
              : <>Agregar {selected.size} participante{selected.size === 1 ? "" : "s"} <span aria-hidden="true">🎁</span></>}
        </Button>
      </div>
    </div>
  );
}
