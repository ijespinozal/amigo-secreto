import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

const formatDate = (value) => new Date(value).toLocaleDateString("es-PE");

const RoleBadge = ({ role }) =>
  role === "admin" ? <Badge tone="brand">Admin</Badge> : <Badge tone="gray">Participante</Badge>;

/**
 * Usuarios registrados: tabla en escritorio, tarjetas en celular.
 * @param {number} currentUserId  el admin no puede eliminarse a sí mismo
 */
export default function UsersList({ users, currentUserId, onResetPassword, onDelete }) {
  const actions = (u) => (
    <div className="flex gap-2 justify-end">
      <Button variant="secondary" size="sm" onClick={() => onResetPassword(u)}>
        <span aria-hidden="true">🔑</span> Resetear clave
      </Button>
      {u.id !== currentUserId && (
        <Button variant="danger" size="sm" onClick={() => onDelete(u)}>
          Eliminar
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Escritorio */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cream-200/70 border-b-2 border-gold-400/40 text-amber-950 font-festive font-bold text-sm">
              <th scope="col" className="py-3 px-4 rounded-l-[var(--radius-card)]">Usuario</th>
              <th scope="col" className="py-3 px-4">Teléfono</th>
              <th scope="col" className="py-3 px-4">Rol</th>
              <th scope="col" className="py-3 px-4">Registro</th>
              <th scope="col" className="py-3 px-4 rounded-r-[var(--radius-card)] text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold-400/20">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-cream-50/80 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar firstName={u.firstName} lastName={u.lastName} size="sm" />
                    <span className="font-festive font-bold text-brand-strong">{u.firstName} {u.lastName}</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-semibold tabular-nums">{u.phone}</td>
                <td className="py-3 px-4"><RoleBadge role={u.role} /></td>
                <td className="py-3 px-4 font-semibold text-ink-soft">{formatDate(u.createdAt)}</td>
                <td className="py-3 px-4">{actions(u)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Celular */}
      <ul className="md:hidden space-y-3">
        {users.map((u) => (
          <li key={u.id} className="p-4 bg-white rounded-[var(--radius-card)] border-2 border-gold-400/30">
            <div className="flex items-center gap-3">
              <Avatar firstName={u.firstName} lastName={u.lastName} />
              <div className="min-w-0 flex-1">
                <p className="font-festive font-bold text-brand-strong truncate">{u.firstName} {u.lastName}</p>
                <p className="text-sm font-semibold text-ink-soft tabular-nums">{u.phone} · {formatDate(u.createdAt)}</p>
              </div>
              <RoleBadge role={u.role} />
            </div>
            <div className="mt-3">{actions(u)}</div>
          </li>
        ))}
      </ul>
    </>
  );
}
