import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import "../styles/PagoExitoso.css";

export default function PagoExitoso() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [estadoPago, setEstadoPago] = useState(null);
  const [error, setError] = useState(null);

  const reference = searchParams.get("reference");

  useEffect(() => {
    const verificarPago = async () => {
      try {
        if (!reference) {
          setError("Referencia de pago no encontrada");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:3000/api/pagos/estado/${reference}`
        );

        const data = await response.json();

        if (response.ok) {
          setEstadoPago(data);
        } else {
          setError(data.msg || "Error obteniendo estado del pago");
        }
      } catch (err) {
        console.error("Error verificando pago:", err);
        setError("Error al verificar el pago");
      } finally {
        setLoading(false);
      }
    };

    // Esperar 2 segundos antes de verificar (Wompi tarda en procesar)
    const timer = setTimeout(verificarPago, 2000);
    return () => clearTimeout(timer);
  }, [reference]);

  if (loading) {
    return (
      <div className="pago-exitoso-container loading-state">
        <div className="success-card">
          <div className="spinner"></div>
          <p className="loading-text">Verificando tu pago...</p>
        </div>
      </div>
    );
  }

  if (error || !estadoPago) {
    return (
      <div className="pago-exitoso-container error-state">
        <div className="success-card">
          <div className="status-icon error">❌</div>
          <h2 className="success-title">Hubo un problema</h2>
          <p className="status-message error-message">
            {error || "No se pudo verificar tu pago"}
          </p>
          <div className="action-buttons">
            <button
              onClick={() => navigate("/carrito")}
              className="btn btn-primary"
            >
              Volver al carrito
            </button>
            <button
              onClick={() => navigate("/")}
              className="btn btn-secondary"
            >
              Ir al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPagado = estadoPago.estado === "APPROVED";

  return (
    <div className={`pago-exitoso-container ${isPagado ? "success-state" : "pending-state"}`}>
      <div className="success-card">
        <div className={`status-icon ${isPagado ? "success" : "pending"}`}>
          {isPagado ? "✅" : "⏳"}
        </div>

        <h2 className="success-title">
          {isPagado ? "¡Pago Completado!" : "Pago en Proceso"}
        </h2>

        <p className="status-message">
          {isPagado
            ? "Tu transacción fue aprobada exitosamente. Tu pedido está siendo preparado."
            : "Tu pago está siendo procesado. Recibirás una confirmación muy pronto."}
        </p>

        {/* DETALLES DEL PAGO */}
        <div className="payment-details">
          <div className="detail-row">
            <span className="detail-label">📌 Referencia:</span>
            <span className="detail-value">{estadoPago.reference}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label"> Monto pagado:</span>
            <span className="detail-value highlight">
              ${(estadoPago.amountInCents / 100).toLocaleString("es-CO", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label"> Método:</span>
            <span className="detail-value">{estadoPago.metodoPago || "Tarjeta"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label"> Estado:</span>
            <span className={`detail-value status-badge ${isPagado ? "approved" : "pending"}`}>
              {isPagado ? "Aprobado ✓" : "Procesando..."}
            </span>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="action-buttons">
          {isPagado ? (
            <>
              <button
                onClick={() => navigate("/")}
                className="btn btn-primary"
              >
                Volver a la Tienda
              </button>
              <button
                onClick={() => navigate("/mis-ordenes")}
                className="btn btn-secondary"
              >
                Ver mis Órdenes
              </button>
            </>
          ) : (
            <>
              <p className="warning-text">
                No cierres esta página mientras se procesa tu pago
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                Actualizar Estado
              </button>
            </>
          )}
        </div>

        {/* NOTA DE CONFIRMACIÓN */}
        <div className="confirmation-footer">
          <p>📧 Revisa tu correo para la confirmación del pedido</p>
        </div>
      </div>
    </div>
  );
}
