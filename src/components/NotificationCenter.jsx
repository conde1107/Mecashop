import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/NotificationCenter.css";

const API_BASE = "http://localhost:3000/api";

export default function NotificationCenter() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [alertaVencimiento, setAlertaVencimiento] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const alertaMostradaRef = useRef(false);
  
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Cargar notificaciones
  const cargarNotificaciones = async () => {
    if (!userId || !token) return;
    
    try {
      setCargando(true);
      const res = await fetch(`${API_BASE}/notificaciones/usuario/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotificaciones(data || []);
      
      // Contar no leídas
      const noLeida = data.filter(n => !n.leida).length;
      setNoLeidas(noLeida);

      // Solo mostrar alerta la primera vez (usando ref para que persista)
      if (!alertaMostradaRef.current) {
        const vencidos = data.filter(n => 
          n.tipo === 'documento' && 
          n.titulo.includes('⛔') // Documentos VENCIDOS
        );
        
        if (vencidos.length > 0) {
          setAlertaVencimiento({
            titulo: vencidos[0].titulo,
            mensaje: vencidos[0].mensaje,
            vehiculoId: vencidos[0].referencia_id
          });
          
          // Marcar que la alerta ya fue mostrada
          alertaMostradaRef.current = true;
          
          // Cerrar la alerta automáticamente después de 8 segundos
          setTimeout(() => {
            setAlertaVencimiento(null);
          }, 8000);
        }
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    } finally {
      setCargando(false);
    }
  };

  // Cargar notificaciones al montar
  useEffect(() => {
    cargarNotificaciones();
    // Recargar cada 10 segundos
    const intervalo = setInterval(cargarNotificaciones, 10000);
    return () => clearInterval(intervalo);
  }, [userId, token]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickFuera = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };

    if (abierto) {
      document.addEventListener("click", handleClickFuera);
      return () => document.removeEventListener("click", handleClickFuera);
    }
  }, [abierto]);

  // Marcar como leída
  const marcarComoLeida = async (notificacionId) => {
    try {
      await fetch(`${API_BASE}/notificaciones/leer/${notificacionId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      cargarNotificaciones();
    } catch (error) {
      console.error("Error al marcar como leída:", error);
    }
  };

  // Marcar todas como leídas
  const marcarTodasComoLeidas = async () => {
    try {
      await fetch(`${API_BASE}/notificaciones/leer-todas/${userId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      cargarNotificaciones();
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
    }
  };

  // Eliminar notificación
  const eliminarNotificacion = async (notificacionId) => {
    try {
      await fetch(`${API_BASE}/notificaciones/${notificacionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      cargarNotificaciones();
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
    }
  };

  // Manejar clic en la notificación
  const manejarClickNotificacion = async (notif) => {
    // Marcar como leída
    if (!notif.leida) {
      await marcarComoLeida(notif._id);
    }

    // Si es una notificación de documento, navegar a Mis Vehículos
    if (notif.tipo === 'documento') {
      setAbierto(false);
      
      // Si tiene referencia_id (vehiculoId), pasar como estado
      if (notif.referencia_id) {
        navigate("/mis-vehiculos", { state: { vehiculoId: notif.referencia_id } });
      } else {
        navigate("/mis-vehiculos");
      }
    }
  };

  return (
    <div className="notification-center" ref={menuRef}>
      {/* Botón de notificaciones */}
      <button
        className="notification-btn"
        onClick={() => setAbierto(!abierto)}
        title="Notificaciones"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {noLeidas > 0 && <span className="notification-badge">{noLeidas}</span>}
      </button>

      {/* Dropdown de notificaciones */}
      {abierto && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notificaciones</h3>
            {noLeidas > 0 && (
              <button
                className="btn-mark-all"
                onClick={marcarTodasComoLeidas}
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="notification-list">
            {cargando ? (
              <div className="notification-empty">Cargando...</div>
            ) : notificaciones.length === 0 ? (
              <div className="notification-empty">No hay notificaciones</div>
            ) : (
              notificaciones.map((notif) => (
                <div
                  key={notif._id}
                  className={`notification-item ${!notif.leida ? "no-leida" : ""} ${notif.tipo === 'documento' ? 'clickeable' : ''}`}
                  onClick={() => manejarClickNotificacion(notif)}
                >
                  <div className="notification-content">
                    <h4>{notif.titulo}</h4>
                    <p style={{ whiteSpace: 'pre-line' }}>{notif.mensaje}</p>
                    <small>
                      {new Date(notif.fecha_creacion).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                    {notif.tipo === 'documento' && (
                      <small className="notif-link">👉 Ir a Mis Vehículos</small>
                    )}
                  </div>
                  <button
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      eliminarNotificacion(notif._id);
                    }}
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Alerta flotante de vencimiento */}
      {alertaVencimiento && (
        <div className="alerta-flotante-vencimiento">
          <div className="alerta-contenido">
            <div className="alerta-icono">⛔</div>
            <div className="alerta-texto">
              <h5>{alertaVencimiento.titulo}</h5>
              <p>{alertaVencimiento.mensaje}</p>
            </div>
            <button
              className="alerta-cerrar"
              onClick={() => setAlertaVencimiento(null)}
            >
              ✕
            </button>
          </div>
          <button
            className="alerta-ir-vehiculos"
            onClick={() => {
              if (alertaVencimiento.vehiculoId) {
                navigate("/mis-vehiculos", { state: { vehiculoId: alertaVencimiento.vehiculoId } });
              } else {
                navigate("/mis-vehiculos");
              }
              setAlertaVencimiento(null);
            }}
          >
            Ir a Mis Vehículos →
          </button>
        </div>
      )}
    </div>
  );
}
