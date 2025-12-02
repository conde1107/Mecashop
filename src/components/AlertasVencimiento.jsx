import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/AlertasVencimiento.css";

const AlertasVencimiento = ({ usuarioId, token }) => {
  const navigate = useNavigate();
  const [alertas, setAlertas] = useState([]);
  const [mostrarAlertas, setMostrarAlertas] = useState(false);
  const API_URL = "http://localhost:3000/api";

  useEffect(() => {
    if (usuarioId && token) {
      verificarVencimientos();
    }
  }, [usuarioId, token]);

  const verificarVencimientos = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/vencimientos`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();
      if (data.alertas && data.alertas.length > 0) {
        setAlertas(data.alertas);
        setMostrarAlertas(true);
        
        // Mostrar toast con la primera alerta crítica
        const alertaCritica = data.alertas.find(a => a.estado === "vencido" || a.estado === "critico");
        if (alertaCritica) {
          toast.warning(alertaCritica.mensaje, { autoClose: 5000 });
        }
      }
    } catch (error) {
      console.error("Error verificando vencimientos:", error);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!mostrarAlertas || alertas.length === 0) {
    return null;
  }

  return (
    <div className="alertas-vencimiento-container">
      <div className="alertas-header">
        <h3> Documentos por Vencer</h3>
        <button 
          className="btn-cerrar-alertas"
          onClick={() => setMostrarAlertas(false)}
        >
          ✕
        </button>
      </div>

      <div className="alertas-lista">
        {alertas.map((alerta, idx) => (
          <div key={idx} className={`alerta-item alerta-${alerta.estado}`}>
            <div className="alerta-icono">
              {alerta.estado === "vencido" && "⛔"}
              {alerta.estado === "critico" && "🚨"}
              {alerta.estado === "proximo" && "⚠️"}
            </div>
            <div className="alerta-contenido">
              <p className="alerta-titulo">{alerta.mensaje}</p>
              <p className="alerta-detalle">
                Vehículo: <strong>{alerta.vehiculo}</strong>
              </p>
              <p className="alerta-fecha">
                Vence: <strong>{formatearFecha(alerta.fecha)}</strong>
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="alertas-footer">
        <p className="alertas-aviso">
          Actualiza tu documentación para mantener tu vehículo legalizado.
        </p>
        <button 
          className="btn-ir-vehiculos"
          onClick={() => {
            setMostrarAlertas(false);
            navigate("/mis-vehiculos");
          }}
        >
          Ver Vehículos
        </button>
      </div>
    </div>
  );
};

export default AlertasVencimiento;
