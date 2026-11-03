import { forwardRef, useId } from "react";

/**
 * Campo de formulario con etiqueta, accesorios y mensaje de ayuda/error.
 * @param {ReactNode} [labelAside] contenido a la derecha de la etiqueta
 * @param {ReactNode} [prefix]     bloque a la izquierda dentro del campo (p. ej. 🇵🇪 +51)
 * @param {ReactNode} [icon]       ícono a la izquierda
 * @param {ReactNode} [suffix]     elemento a la derecha (p. ej. botón mostrar contraseña)
 * @param {boolean}   [multiline]  textarea en vez de input
 */
const TextField = forwardRef(function TextField(
  { label, labelAside, prefix, icon, suffix, hint, error, multiline = false, className = "", inputClassName = "", id, ...props },
  ref
) {
  const Control = multiline ? "textarea" : "input";
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helpId = `${inputId}-help`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="font-bold text-sm text-[#4A2E1B] flex items-center gap-1.5">
          <span>{label}</span>
          {labelAside && <span className="ml-auto">{labelAside}</span>}
        </label>
      )}
      <div
        className={`relative flex items-center rounded-xl bg-white has-[:disabled]:bg-stone-100 border-2 shadow-sm transition-all focus-within:ring-2 ${
          error
            ? "border-red-400 focus-within:ring-red-200"
            : "border-amber-200/80 focus-within:border-pine-700 focus-within:ring-pine-700/20"
        }`}
      >
        {prefix && (
          <div className="flex items-center gap-1.5 self-stretch px-3 bg-amber-50/80 rounded-l-[10px] border-r border-amber-200/70 select-none font-festive font-bold text-sm text-[#4A2E1B]">
            {prefix}
          </div>
        )}
        {icon && <span className="absolute left-3 text-stone-400 pointer-events-none" aria-hidden="true">{icon}</span>}
        <Control
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={hint || error ? helpId : undefined}
          className={`m-0 w-full min-w-0 bg-transparent py-2.5 font-semibold text-ink placeholder:text-stone-400 focus:outline-none text-base rounded-xl disabled:text-stone-500 disabled:cursor-not-allowed ${
            icon ? "pl-10" : "pl-3"
          } ${suffix ? "pr-11" : "pr-3"} ${multiline ? "resize-y min-h-[80px]" : ""} ${inputClassName}`}
          {...props}
        />
        {suffix && <div className="absolute right-2">{suffix}</div>}
      </div>
      {(error || hint) && (
        <p id={helpId} className={`text-xs font-semibold ${error ? "text-red-700" : "text-stone-500"}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
});

export default TextField;
