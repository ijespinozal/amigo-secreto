import Button from "../ui/Button";

/**
 * Encabezado de las pantallas internas: volver, título y subtítulo.
 * @param {ReactNode} [children] contenido extra bajo el subtítulo (p. ej. progreso)
 */
export default function PageHeader({
  title,
  emoji,
  subtitle,
  backTo = "/user/home",
  backLabel = "Volver a Mi espacio",
  children,
}) {
  return (
    <section>
      <Button to={backTo} variant="ghost" size="sm" className="text-on-page hover:bg-white/10 -ml-3">
        ← {backLabel}
      </Button>
      <h1 className="font-festive font-bold text-3xl sm:text-4xl text-on-page drop-shadow-md tracking-tight mt-1">
        {title} {emoji && <span aria-hidden="true">{emoji}</span>}
      </h1>
      {subtitle && <p className="font-semibold text-on-page/90 mt-1">{subtitle}</p>}
      {children && <div className="mt-3">{children}</div>}
    </section>
  );
}
