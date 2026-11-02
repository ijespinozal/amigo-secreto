import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ChangePasswordModal from "./ChangePasswordModal";

export default function Header() {
  const { user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-white border-b border-red-200 shadow-md">

      {openPasswordModal && (
        <ChangePasswordModal
          open={openPasswordModal}
          onClose={() => setOpenPasswordModal(false)}
        />
      )}
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">

        {/* LOGO */}
        <Link
          to={
            user
              ? user.role === "admin"
                ? "/admin/dashboard"
                : "/user/home"
              : "/"
          }
          className="flex items-center gap-2 text-2xl md:text-3xl font-extrabold text-green-700 hover:text-green-800 transition"
        >
          🎁 <span>Amigo Secreto</span>
        </Link>

        {/* BOTONES */}
        <div className="flex gap-3 items-center">

          {user ? (
            <>
              {/* ADMIN = botón normal */}
              {user.role === "admin" ? (
                <Link
                  to="/admin/dashboard"
                  className="px-4 py-2 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition transform hover:scale-105 shadow-sm text-sm md:text-base"
                >
                  Administrador
                </Link>
              ) : (
                /* USUARIO NORMAL = MENÚ DESPLEGABLE 👤 */
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setOpenMenu((prev) => !prev)}
                    className="text-2xl bg-green-700 w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold hover:bg-green-800 transition shadow-md"
                    style={{ lineHeight: 1 }}
                  >
                    Inicio
                  </button>

                  {/* MENÚ */}
                  {openMenu && (
                    <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border border-gray-200 py-2 animate-fadeInUp z-50">
                      <Link
                        to="/user/home"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpenMenu(false)}
                      >
                        Mi espacio
                      </Link>

                      <Link
                        to="/user/group-gifts"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpenMenu(false)}
                      >
                        Regalos del grupo
                      </Link>

                      <button
                        className="block w-full text-left px-4 py-2 !bg-white !text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setOpenMenu(false);
                          setOpenPasswordModal(true);
                        }}
                      >
                        Cambiar contraseña
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* BOTÓN SALIR */}
              <button
                onClick={() => logout()}
                className="px-4 py-2 !bg-red-600 text-white text-center rounded-lg font-semibold hover:bg-red-700 transition transform hover:scale-105 shadow-sm text-sm md:text-base"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                to="/"
                className="px-4 py-2 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition transform hover:scale-105 shadow-sm text-sm md:text-base"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition transform hover:scale-105 shadow-sm text-sm md:text-base"
              >
                Registro
              </Link>
            </>
          )}

        </div>
      </div>
    </header>
  );
}
