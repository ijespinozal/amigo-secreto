import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ChangePasswordModal from "./ChangePasswordModal";
import ProfileModal from "./ProfileModal";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";

const LIGHT_COLORS = ["#F9CF6E", "#F87171", "#4ADE80", "#60A5FA", "#F9CF6E", "#F472B6"];

/** Guirnalda de luces (visible solo en el tema verde, ver index.css). */
function Garland() {
  return (
    <div aria-hidden="true" className="garland absolute inset-x-0 top-0 justify-around px-6 pointer-events-none">
      {Array.from({ length: 18 }, (_, i) => (
        <span
          key={i}
          className="garland-light mt-1.5 h-2.5 w-2.5 rounded-full"
          style={{
            background: LIGHT_COLORS[i % LIGHT_COLORS.length],
            boxShadow: `0 0 10px 2px ${LIGHT_COLORS[i % LIGHT_COLORS.length]}`,
            animationDelay: `${(i % 6) * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}

const menuItem =
  "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-left text-[#4A261D] bg-transparent rounded-none hover:bg-gold-400/20 transition-colors";

function UserMenu({ user, onEditProfile, onChangePassword, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isAdmin = user.role === "admin";

  // Cerrar con clic afuera o Escape
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Menú de usuario"
        className="w-auto flex items-center gap-2.5 p-1.5 pr-3 bg-cream-50 hover:bg-white text-[#4A261D] rounded-full border border-gold-400/50 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
      >
        <Avatar firstName={user.firstName} lastName={user.lastName} size="sm" className="ring-2 ring-gold-400" />
        <span className="font-festive font-semibold text-sm hidden sm:inline max-w-[140px] truncate">{user.firstName}</span>
        <span aria-hidden="true" className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-cream-50 rounded-[var(--radius-card)] shadow-[var(--shadow-cozy)] border-2 border-gold-400/30 py-2 z-50 overflow-hidden animate-fade-in">
          <p className="px-4 pt-1 pb-2 text-xs font-bold text-stone-500 truncate">
            {user.firstName} {user.lastName}
          </p>
          {isAdmin ? (
            <Link to="/admin/dashboard" onClick={close} className={menuItem}>
              <span aria-hidden="true">🎛️</span> Panel de administración
            </Link>
          ) : (
            <>
              <Link to="/user/home" onClick={close} className={menuItem}>
                <span aria-hidden="true">🏠</span> Mi espacio
              </Link>
              <Link to="/user/group-gifts" onClick={close} className={menuItem}>
                <span aria-hidden="true">🎁</span> Regalos del grupo
              </Link>
            </>
          )}
          {/* Cuenta: disponible para participantes y para el admin */}
          <button type="button" onClick={() => { close(); onEditProfile(); }} className={menuItem}>
            <span aria-hidden="true">✏️</span> Mis datos
          </button>
          <button type="button" onClick={() => { close(); onChangePassword(); }} className={menuItem}>
            <span aria-hidden="true">🔑</span> Cambiar contraseña
          </button>
          <div className="my-1.5 border-t border-amber-900/10" />
          <button type="button" onClick={() => { close(); onLogout(); }} className={`${menuItem} !text-red-700 hover:!bg-red-50`}>
            <span aria-hidden="true">🚪</span> Salir
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);

  const home = user ? (user.role === "admin" ? "/admin/dashboard" : "/user/home") : "/";

  return (
    <header className="relative z-40 w-full bg-header backdrop-blur-md border-b-2 border-gold-400/40 shadow-sm">
      <Garland />

      <ChangePasswordModal open={openPasswordModal} onClose={() => setOpenPasswordModal(false)} />
      <ProfileModal open={openProfileModal} onClose={() => setOpenProfileModal(false)} />

      <div className="max-w-[1100px] mx-auto px-4 sm:px-8 h-[72px] flex items-center justify-between gap-3">
        <Link to={home} className="flex items-center gap-2 group active:scale-95 transition-transform">
          <span className="text-3xl" aria-hidden="true">🎁</span>
          <span className="font-festive font-bold text-xl sm:text-2xl tracking-tight text-header-ink whitespace-nowrap">
            Amigo Secreto
          </span>
        </Link>

        {user ? (
          <UserMenu
            user={user}
            onEditProfile={() => setOpenProfileModal(true)}
            onChangePassword={() => setOpenPasswordModal(true)}
            onLogout={() => logout()}
          />
        ) : (
          // Solo el acceso a la otra pantalla: en el login no tiene sentido "Iniciar sesión".
          <nav>
            {pathname === "/register" ? (
              <Button to="/" variant="secondary" size="sm" className="whitespace-nowrap">Iniciar sesión</Button>
            ) : (
              <Button to="/register" variant="gold" size="sm" className="whitespace-nowrap">Registrarme</Button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
