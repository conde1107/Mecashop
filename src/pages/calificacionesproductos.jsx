import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/calificacionesproductos.css';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const CalificacionesProductos = () => {
  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstrella, setFiltroEstrella] = useState(0);

  const token = localStorage.getItem("token");
  const tiendaId = localStorage.getItem("userId");

  // =====================
  // Cargar calificaciones
  // =====================
  useEffect(() => {
    cargarCalificaciones();
  }, [tiendaId, token]);

  const cargarCalificaciones = async () => {
    if (!tiendaId || !token) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/calificacion-producto/tienda/${tiendaId}`);
      if (res.ok) {
        const data = await res.json();
        setCalificaciones(data);
      } else {
        toast.error("Error al cargar las calificaciones");
      }
    } catch (error) {
      console.error("Error al cargar calificaciones:", error);
      toast.error("Error en la conexión");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar calificaciones por estrellas
  const calificacionesFiltradas = filtroEstrella === 0 
    ? calificaciones 
    : calificaciones.filter(c => c.calificacion === filtroEstrella);

  // Calcular estadísticas
  const totalCalificaciones = calificaciones.length;
  const promedioCalificaciones = totalCalificaciones > 0
    ? (calificaciones.reduce((sum, c) => sum + c.calificacion, 0) / totalCalificaciones).toFixed(1)
    : 0;

  const conteoEstrellas = {
    5: calificaciones.filter(c => c.calificacion === 5).length,
    4: calificaciones.filter(c => c.calificacion === 4).length,
    3: calificaciones.filter(c => c.calificacion === 3).length,
    2: calificaciones.filter(c => c.calificacion === 2).length,
    1: calificaciones.filter(c => c.calificacion === 1).length,
  };

  if (loading) {
    return (
      <div className="calificaciones-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando calificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calificaciones-page">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="page-header">
        <div className="header-content">
          <h1>Calificaciones de Productos</h1>
          <p>Opiniones de tus clientes sobre tus productos</p>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      {totalCalificaciones > 0 && (
        <div className="estadisticas-section">
          <div className="promedio-card">
            <div className="promedio-value">
              {promedioCalificaciones}
              <span className="star">★</span>
            </div>
            <p className="promedio-label">Calificación Promedio</p>
            <p className="total-opiniones">({totalCalificaciones} opiniones)</p>
          </div>

          <div className="distribucion-estrellas">
            <h3>Distribución de Calificaciones</h3>
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="distribucion-item">
                <span className="stars-label">
                  {"★".repeat(stars)}
                </span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${totalCalificaciones > 0 ? (conteoEstrellas[stars] / totalCalificaciones) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="count">{conteoEstrellas[stars]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILTROS */}
      {totalCalificaciones > 0 && (
        <div className="filtros-section">
          <h3>Filtrar por Calificación</h3>
          <div className="filtros-buttons">
            <button 
              className={`filtro-btn ${filtroEstrella === 0 ? 'active' : ''}`}
              onClick={() => setFiltroEstrella(0)}
            >
              Todas ({totalCalificaciones})
            </button>
            {[5, 4, 3, 2, 1].map((stars) => (
              <button 
                key={stars}
                className={`filtro-btn ${filtroEstrella === stars ? 'active' : ''}`}
                onClick={() => setFiltroEstrella(stars)}
              >
                {"★".repeat(stars)} ({conteoEstrellas[stars]})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* LISTA DE CALIFICACIONES */}
      <div className="calificaciones-container">
        {calificacionesFiltradas.length === 0 ? (
          <div className="no-calificaciones">
            <div className="empty-icon">📭</div>
            <h3>No hay calificaciones</h3>
            <p>
              {filtroEstrella > 0 
                ? `No tienes calificaciones de ${filtroEstrella} estrellas` 
                : "Aún no tienes calificaciones. ¡Pronto recibirás opiniones de tus clientes!"}
            </p>
          </div>
        ) : (
          <div className="calificaciones-list">
            {calificacionesFiltradas.map((cal, idx) => (
              <div key={idx} className="calificacion-item">
                <div className="calificacion-header">
                  <div className="producto-info">
                    {cal.productoId?.imagenURL && (
                      <img 
                        src={`${API_BASE}${cal.productoId.imagenURL}`} 
                        alt={cal.productoId?.nombre}
                        className="producto-thumb"
                      />
                    )}
                    <div className="producto-detalles">
                      <h4>{cal.productoId?.nombre}</h4>
                      <p className="usuario-nombre">{cal.usuarioId?.nombre || "Usuario Anónimo"}</p>
                    </div>
                  </div>
                  <div className="estrellas-rating">
                    <span className="stars">{"★".repeat(cal.calificacion)}</span>
                    <span className="rating-number">{cal.calificacion}/5</span>
                  </div>
                </div>
                
                {cal.comentario && (
                  <div className="comentario-section">
                    <p className="comentario-texto">"{cal.comentario}"</p>
                  </div>
                )}
                
                <div className="calificacion-footer">
                  <small className="fecha-comentario">
                    📅 {new Date(cal.fecha).toLocaleDateString("es-ES", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalificacionesProductos;
