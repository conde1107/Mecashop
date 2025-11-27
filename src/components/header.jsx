// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";
import LogoutButton from "./LogoutButton";
import NotificationCenter from "./NotificationCenter";

const API_BASE = "http://localhost:3000/api";

export default function Header({ loggedIn, onLogout }) {
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const [menuOpen, setMenuOpen] = useState(false);
  const [citasPendientes, setCitasPendientes] = useState(0);

  // 🔹 Determinar ruta de perfil según el rol
  let perfilPath = "/login";
  if (role === "cliente") perfilPath = "/perfil-cliente";
  else if (role === "mecanico") perfilPath = "/mecanico-Dashboard";
  else if (role === "tienda") perfilPath = "/tienda-Dashboard";
  else if (role === "admin") perfilPath = "/admin";

  // 🔹 Cargar citas pendientes (solo clientes)
  useEffect(() => {
    if (role !== "cliente" || !userId) return;

    const fetchCitasPendientes = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_BASE}/solicitudes/cliente/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        // Contar solo las citas aceptadas que aún no están completadas
        const pendientes = data.filter(c => c.estado === "aceptada").length;
        setCitasPendientes(pendientes);
      } catch (error) {
        console.error("Error al obtener citas pendientes:", error);
      }
    };

    fetchCitasPendientes();
  }, [role, userId]);

  return (
    <header className="header">
      {/* 🔹 Logo */}
      <div className="logo-container">
        <Link to="/" onClick={() => setMenuOpen(false)}>
          <img className="logo" src="/file.jpg" alt="MecaShop" />
        </Link>
      </div>

      {/* 🔹 Menú de navegación */}
      <nav className="nav">
        {/* 🔸 Cliente */}
        {role === "cliente" && (
          <>
            <Link to="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
            <Link to="/carrito" onClick={() => setMenuOpen(false)}>Carrito</Link>
            <Link to="/directorio" onClick={() => setMenuOpen(false)}>Directorio</Link>
            <Link to="/solicitar-cita" onClick={() => setMenuOpen(false)}>Solicitar Cita</Link>
            <Link to="/calificar-servicio" onClick={() => setMenuOpen(false)}>Calificar</Link>

            {/* 🔹 Mis Citas antes de Perfil */}
            <Link to="/mis-citas" onClick={() => setMenuOpen(false)} className="link-citas">
              Mis Citas
              {citasPendientes > 0 && <span className="badge">{citasPendientes}</span>}
            </Link>

            {/* 🔹 Mis Vehículos */}
            <Link to="/mis-vehiculos" onClick={() => setMenuOpen(false)}>Mis Vehículos</Link>

            {/* 🔹 Perfil al final */}
            <Link to={perfilPath} onClick={() => setMenuOpen(false)}>Perfil</Link>
          </>
        )}

        {/* 🔸 Mecánico */}
        {role === "mecanico" && (
          <>
            <Link to="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
            <Link to="/servicios" onClick={() => setMenuOpen(false)}>Servicios</Link>
            <Link to="/citas" onClick={() => setMenuOpen(false)}>Citas</Link>
            <Link to={perfilPath} onClick={() => setMenuOpen(false)}>Perfil</Link>
          </>
        )}

        {/* 🔸 Tienda */}
        {role === "tienda" && (
          <>
            <Link to="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
            <Link to="/catalogo" onClick={() => setMenuOpen(false)}>Catálogo</Link>
            <Link to="/mis-mecanicos" onClick={() => setMenuOpen(false)}>Mis Mecánicos</Link>
            <Link to="/calificaciones-productos" onClick={() => setMenuOpen(false)}>Calificaciones</Link>
            <Link to={perfilPath} onClick={() => setMenuOpen(false)}>Perfil</Link>
          </>
        )}

        {/* 🔸 Administrador */}
        {role === "admin" && (
          <>
            <Link to="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
            <Link to="/admin" onClick={() => setMenuOpen(false)}>Panel</Link>
          </>
        )}

        {/* 🔸 Visitante (no logueado) */}
        {!loggedIn && (
          <>
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/solicitar-acceso" onClick={() => setMenuOpen(false)}>Registrarse</Link>
            <Link to="/ayuda" onClick={() => setMenuOpen(false)}>Ayuda</Link>
          </>
        )}
      </nav>

      {/* 🔹 Botón de Logout */}
      <div className="header-right">
        {loggedIn && (
          <>
            <NotificationCenter />
            <LogoutButton onLogout={onLogout} />
          </>
        )}
      </div>
    </header>
  );
}
