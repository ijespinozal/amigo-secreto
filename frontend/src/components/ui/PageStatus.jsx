import Card from "../Card";
import Spinner from "../Spinner";
import Button from "./Button";

/** Indicador de carga centrado para una pantalla completa. */
export function PageLoading() {
  return (
    <div className="flex justify-center items-center h-40" role="status" aria-label="Cargando">
      <span className="relative flex items-center justify-center">
        <Spinner size="lg" />
        <span aria-hidden="true" className="absolute text-2xl">🎁</span>
      </span>
    </div>
  );
}

/**
 * Error al cargar una pantalla, con botón para reintentar.
 * @param {() => void} [onRetry]
 * @param {ReactNode}  [children] acciones extra junto a "Reintentar" (p. ej. volver)
 */
export function PageError({ message, onRetry, retrying = false, children }) {
  return (
    <Card className="max-w-xl mx-auto text-center">
      <div aria-hidden="true" className="text-4xl mb-2">⚠️</div>
      <p className="font-semibold text-red-700">{message}</p>
      {(onRetry || children) && (
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry} disabled={retrying}>
              {retrying ? "Reintentando..." : "Reintentar"}
            </Button>
          )}
          {children}
        </div>
      )}
    </Card>
  );
}

/** Mensaje vacío/informativo dentro de una tarjeta. */
export function EmptyState({ icon, title, children }) {
  return (
    <div className="text-center py-6">
      {icon && <div aria-hidden="true" className="text-5xl mb-2">{icon}</div>}
      <p className="font-festive font-bold text-lg text-brand-strong">{title}</p>
      {children && <p className="text-sm font-semibold text-ink-soft mt-1">{children}</p>}
    </div>
  );
}
