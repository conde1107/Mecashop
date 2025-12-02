import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../styles/Checkout.css";

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metodoPago, setMetodoPago] = useState("tarjeta");
  const [procesando, setProcesando] = useState(false);
  
  // Estados para información de pago
  const [infoPago, setInfoPago] = useState({
    numeroTarjeta: "",
    nombreTitular: "",
    fechaVencimiento: "",
    cvv: "",
    cuentaBancaria: "",
    tipoCuenta: "corriente",
    banco: "",
    telefonoWallet: "",
    walletTipo: "nequi"
  });

  const amount = searchParams.get("amount");
  const tipo = searchParams.get("tipo");
  const itemsParam = searchParams.get("items");
  const items = itemsParam ? JSON.parse(decodeURIComponent(itemsParam)) : [];

  // Calcular subtotal en pesos
  const subtotalCentavos = parseInt(amount) || 0;
  const subtotalPesos = (subtotalCentavos / 100).toFixed(2);

  useEffect(() => {
    console.log(" Checkout cargado");
    console.log("Items:", items);
    console.log("Subtotal:", subtotalPesos);
  }, []);

  const metodosPago = [
    { id: "tarjeta", nombre: "💳 Tarjeta de Crédito/Débito", icono: "🏦" },
    { id: "transferencia", nombre: "🏪 Transferencia Bancaria", icono: "🏦" },
    { id: "wallet", nombre: "📱 Billetera Digital", icono: "📱" }
  ];

  const handleChangePago = (e) => {
    setInfoPago({
      numeroTarjeta: "",
      nombreTitular: "",
      fechaVencimiento: "",
      cvv: "",
      cuentaBancaria: "",
      tipoCuenta: "corriente",
      banco: "",
      telefonoWallet: "",
      walletTipo: "nequi"
    });
    setMetodoPago(e.target.value);
  };

  const handleChangeInfoPago = (field, value) => {
    setInfoPago(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Cargar script de Wompi antes de abrir checkout
  const cargarWompi = () => {
    return new Promise((resolve, reject) => {
      if (window.WidgetCheckout) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.wompi.co/widget.js";
      script.async = true;
      script.onload = () => {
        setTimeout(resolve, 500);
      };
      script.onerror = () => {
        reject(new Error("Error cargando Wompi"));
      };
      document.body.appendChild(script);
    });
  };

  const abrirCheckout = async () => {
    try {
      setProcesando(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
        return;
      }

      // Cargar script de Wompi
      await cargarWompi();

      // Crear pago en backend
      const createResponse = await fetch("http://localhost:3000/api/pagos/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseInt(amount),
          tipoPago: tipo || "carrito",
          items: items,
          description: `Compra ${tipo || "general"} en Mecashop`,
          reference: `PAGO_${Date.now()}`,
          metodoPago: metodoPago
        })
      });

      const createData = await createResponse.json();

      if (!createData.success) {
        setError(createData.msg || "Error preparando pago");
        setProcesando(false);
        return;
      }

      const pagoData = createData.pago;

      // Validar que tenemos las claves de Wompi
      if (!pagoData.publicKey || pagoData.publicKey.includes("xxx")) {
        setError(" Claves de Wompi no configuradas. Contacta al administrador.");
        setProcesando(false);
        return;
      }

      // Abrir Wompi Checkout
      if (window.WidgetCheckout) {
        try {
          const checkout = new window.WidgetCheckout({
            currency: "COP",
            amountInCents: parseInt(amount),
            reference: pagoData.reference,
            publicKey: pagoData.publicKey,
            redirectUrl: pagoData.redirectUrl
          });

          checkout.open((transactionId) => {
            console.log(" Transacción completada:", transactionId);
            navigate(`/pago-exitoso?reference=${pagoData.reference}`);
          });
        } catch (checkoutError) {
          setError("Error abriendo pasarela de pagos: " + checkoutError.message);
          setProcesando(false);
        }
      } else {
        setError("Wompi no está disponible. Recarga la página.");
        setProcesando(false);
      }
    } catch (err) {
      console.error("Error en checkout:", err);
      setError("Error: " + err.message);
      setProcesando(false);
    }
  };

  const handleCerrar = () => {
    navigate("/carrito");
  };

  if (error) {
    return (
      <div className="checkout-container error-container">
        <div className="checkout-card">
          <h2 className="checkout-title error-title">❌ Error</h2>
          <p className="error-message">{error}</p>
          <div className="button-group">
            <button
              onClick={handleCerrar}
              className="btn btn-primary"
            >
              Volver al carrito
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-secondary"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <h1 className="checkout-title">Resumen de Compra</h1>

        {/* DETALLES DE PRODUCTOS */}
        <div className="order-summary">
          <h2 className="section-title"> Productos</h2>
          <div className="items-list">
            {items.length > 0 ? (
              items.map((item, index) => (
                <div key={index} className="item-row">
                  <div className="item-info">
                    <span className="item-name">{item.nombre}</span>
                    <span className="item-qty">x{item.cantidad}</span>
                  </div>
                  <span className="item-price">
                    ${(item.precio * item.cantidad).toLocaleString("es-CO")}
                  </span>
                </div>
              ))
            ) : (
              <p className="no-items">No hay productos en el carrito</p>
            )}
          </div>

          {/* SUBTOTAL */}
          <div className="subtotal-section">
            <div className="subtotal-row">
              <span className="subtotal-label">Subtotal:</span>
              <span className="subtotal-amount">${parseFloat(subtotalPesos).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* SELECCIONAR MÉTODO DE PAGO */}
        <div className="payment-method-section">
          <h2 className="section-title">💳 Método de Pago</h2>
          
          {/* SELECT DE MÉTODO */}
          <select 
            value={metodoPago} 
            onChange={handleChangePago}
            className="payment-select"
            disabled={procesando}
          >
            <option value="">-- Selecciona un método de pago --</option>
            {metodosPago.map(metodo => (
              <option key={metodo.id} value={metodo.id}>
                {metodo.nombre}
              </option>
            ))}
          </select>

          {/* FORMULARIO DINÁMICO POR MÉTODO DE PAGO */}
          {metodoPago && (
            <div className="payment-form">
              {/*  TARJETA DE CRÉDITO/DÉBITO */}
              {metodoPago === "tarjeta" && (
                <div className="form-section">
                  <h3>Información de la Tarjeta</h3>
                  <div className="form-group">
                    <label>Número de Tarjeta *</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      value={infoPago.numeroTarjeta}
                      onChange={(e) => handleChangeInfoPago("numeroTarjeta", e.target.value)}
                      disabled={procesando}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nombre del Titular *</label>
                    <input
                      type="text"
                      placeholder="Juan Pérez"
                      value={infoPago.nombreTitular}
                      onChange={(e) => handleChangeInfoPago("nombreTitular", e.target.value)}
                      disabled={procesando}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Fecha de Vencimiento *</label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        maxLength="5"
                        value={infoPago.fechaVencimiento}
                        onChange={(e) => handleChangeInfoPago("fechaVencimiento", e.target.value)}
                        disabled={procesando}
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV *</label>
                      <input
                        type="text"
                        placeholder="123"
                        maxLength="4"
                        value={infoPago.cvv}
                        onChange={(e) => handleChangeInfoPago("cvv", e.target.value)}
                        disabled={procesando}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/*  TRANSFERENCIA BANCARIA */}
              {metodoPago === "transferencia" && (
                <div className="form-section">
                  <h3>Información Bancaria</h3>
                  <div className="form-group">
                    <label>Selecciona tu Banco *</label>
                    <select
                      value={infoPago.banco}
                      onChange={(e) => handleChangeInfoPago("banco", e.target.value)}
                      disabled={procesando}
                    >
                      <option value="">-- Selecciona un banco --</option>
                      <option value="bancolombia">Bancolombia</option>
                      <option value="davivienda">Davivienda</option>
                      <option value="bbva">BBVA</option>
                      <option value="scotiabank">Scotiabank</option>
                      <option value="santander">Santander</option>
                      <option value="itau">Itaú</option>
                      <option value="otro">Otro banco</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tipo de Cuenta *</label>
                    <div className="radio-group">
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="tipoCuenta"
                          value="corriente"
                          checked={infoPago.tipoCuenta === "corriente"}
                          onChange={(e) => handleChangeInfoPago("tipoCuenta", e.target.value)}
                          disabled={procesando}
                        />
                        Cuenta Corriente
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="tipoCuenta"
                          value="ahorros"
                          checked={infoPago.tipoCuenta === "ahorros"}
                          onChange={(e) => handleChangeInfoPago("tipoCuenta", e.target.value)}
                          disabled={procesando}
                        />
                        Cuenta de Ahorros
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Número de Cuenta *</label>
                    <input
                      type="text"
                      placeholder="0123456789"
                      value={infoPago.cuentaBancaria}
                      onChange={(e) => handleChangeInfoPago("cuentaBancaria", e.target.value)}
                      disabled={procesando}
                    />
                  </div>
                  <div className="info-box">
                    <p>📌 Recibirás instrucciones de transferencia después de confirmar.</p>
                  </div>
                </div>
              )}

              {/*  BILLETERA DIGITAL */}
              {metodoPago === "wallet" && (
                <div className="form-section">
                  <h3>Información de Billetera Digital</h3>
                  <div className="form-group">
                    <label>Selecciona la Billetera *</label>
                    <select
                      value={infoPago.walletTipo}
                      onChange={(e) => handleChangeInfoPago("walletTipo", e.target.value)}
                      disabled={procesando}
                    >
                      <option value="nequi">Nequi</option>
                      <option value="daviplata">Daviplata</option>
                      <option value="movil">Movil</option>
                      <option value="bolsapay">BolsaPay</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Número de Celular *</label>
                    <input
                      type="tel"
                      placeholder="+57 312 3456789"
                      value={infoPago.telefonoWallet}
                      onChange={(e) => handleChangeInfoPago("telefonoWallet", e.target.value)}
                      disabled={procesando}
                    />
                  </div>
                  <div className="info-box">
                    <p>📌 Se enviará un código de verificación a tu celular.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="action-buttons">
          <button
            onClick={handleCerrar}
            className="btn btn-secondary"
            disabled={procesando}
          >
            Volver al carrito
          </button>
          <button
            onClick={abrirCheckout}
            className="btn btn-primary"
            disabled={procesando}
          >
            {procesando ? (
              <>
                <span className="spinner"></span>
                Procesando...
              </>
            ) : (
              "Continuar al Pago"
            )}
          </button>
        </div>

        <p className="secure-badge"> Transacción segura con Wompi</p>
      </div>
    </div>
  );
}
