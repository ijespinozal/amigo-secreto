import React from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-white border-b border-red-200 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">

        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl md:text-3xl font-extrabold text-green-700 hover:text-green-800 transition"
        >
          🎁 <span>Amigo Secreto</span>
        </Link>

        {/* BOTONES */}
        <div className="flex gap-3 items-center">

          {user ? (
            <>
              {user.role === "admin" ? (
                <Link
                  to="/admin/dashboard"
                  className="px-4 py-2 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition transform hover:scale-105 shadow-sm text-sm md:text-base"
                >
                  Administrador
                </Link>
              ) : (
                <Link
                  to="/user/home"
                  className="px-4 py-2 bg-green-700 text-white text-center rounded-lg font-semibold hover:bg-green-800 transition transform hover:scale-105 shadow-sm text-sm md:text-base"
                >
                  Mi espacio
                </Link>
              )}

              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white text-center rounded-lg font-semibold hover:bg-red-700 transition transform hover:scale-105 shadow-sm text-sm md:text-base"
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
