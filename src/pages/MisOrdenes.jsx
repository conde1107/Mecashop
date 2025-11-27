import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MisOrdenes.css";

export default function MisOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarOrdenes = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          "http://localhost:3000/api/pagos/mis-ordenes",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (response.ok) {
          setOrdenes(data.ordenes || []);
        } else {
          setError(data.msg || "Error cargando órdenes");
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Error al cargar las órdenes");
      } finally {
        setLoading(false);
      }
    };

    cargarOrdenes();
  }, [navigate]);

  const handleVolverAlInicio = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="mis-ordenes-container loading">
        <div className="spinner"></div>
        <p>Cargando órdenes...</p>
      </div>
    );
  }

  return (
    <div className="mis-ordenes-container">
      <div className="ordenes-header">
        <h1 className="page-title">📦 Mis Órdenes</h1>
        <p className="subtitle">Historial de compras y estado de entregas</p>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

      {ordenes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h2>No tienes órdenes aún</h2>
          <p>¡Comienza a comprar productos en nuestra tienda!</p>
          <button onClick={handleVolverAlInicio} className="btn btn-primary">
            Ir a la Tienda
          </button>
        </div>
      ) : (
        <div className="ordenes-list">
          {ordenes.map((orden) => (
            <div key={orden._id} className="orden-card">
              <div className="orden-header">
                <div className="orden-info">
                  <h3 className="orden-reference">{orden.reference}</h3>
                  <p className="orden-fecha">
                    {new Date(orden.createdAt).toLocaleDateString("es-CO")}
                  </p>
                </div>
                <span className={`status-badge status-${orden.estado?.toLowerCase()}`}>
                  {orden.estado || "Procesando"}
                </span>
              </div>

              <div className="orden-content">
                {orden.items && orden.items.length > 0 && (
                  <div className="items-section">
                    <h4>Productos:</h4>
                    <ul className="items-list">
                      {orden.items.map((item, idx) => (
                        <li key={idx}>
                          <span>{item.nombre} x{item.cantidad}</span>
                          <span>${(item.precio * item.cantidad).toLocaleString("es-CO")}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="orden-amount">
                  <span className="amount-label">Total:</span>
                  <span className="amount-value">
                    ${(orden.amountInCents / 100).toLocaleString("es-CO", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={handleVolverAlInicio} className="btn btn-secondary back-button">
        ← Volver
      </button>
    </div>
  );
}
