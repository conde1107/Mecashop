// pages/Carrito.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/carrito.css";

export default function Carrito() {
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarCarrito = () => {
      const itemsGuardados = JSON.parse(localStorage.getItem("carrito")) || [];
      setCarrito(itemsGuardados);
    };
    cargarCarrito();
    window.addEventListener("storage", cargarCarrito);
    return () => window.removeEventListener("storage", cargarCarrito);
  }, []);

  const actualizarCantidad = (id, cantidad) => {
    if (cantidad < 1) return;
    const nuevoCarrito = carrito.map((item) =>
      item.id === id ? { ...item, cantidad: parseInt(cantidad) } : item
    );
    setCarrito(nuevoCarrito);
    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
  };

  const eliminarProducto = (id) => {
    const nuevoCarrito = carrito.filter((item) => item.id !== id);
    setCarrito(nuevoCarrito);
    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
  };

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  // 💳 INTEGRACIÓN WOMPI
  const handlePagarConWompi = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Debes iniciar sesión para continuar");
        navigate("/login");
        return;
      }

      // 🔍 VALIDAR STOCK ANTES DE PAGAR
      const carritoConIds = carrito.map(item => ({
        productoId: item.id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio
      }));

      const validacionResponse = await fetch("http://localhost:3000/api/pagos/validar-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ items: carritoConIds })
      });

      const validacionData = await validacionResponse.json();

      if (!validacionResponse.ok) {
        // Mostrar errores de stock
        let mensaje = "❌ Stock insuficiente:\n\n";
        if (validacionData.errores) {
          validacionData.errores.forEach(error => {
            mensaje += `${error.nombre}: ${error.error}\n`;
          });
        }
        alert(mensaje);
        setLoading(false);
        return;
      }

      // ✅ Stock validado, proceder con pago
      const itemsEncoded = encodeURIComponent(JSON.stringify(carritoConIds));
      const totalEnCentavos = Math.round(total * 100);

      navigate(`/checkout?amount=${totalEnCentavos}&tipo=carrito&items=${itemsEncoded}`);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al procesar el pago: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (carrito.length === 0) {
    return (
      <div className="carrito-vacio">
        <h2>Tu carrito está vacío</h2>
        <Link to="/" className="btn-seguir">
          Seguir comprando
        </Link>
      </div>
    );
  }

  return (
    <div className="carrito-container">
      <h2>Tu Carrito de Compras</h2>

      <table className="tabla-carrito">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio (COP)</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {carrito.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="producto-info">
                  <img src={`http://localhost:3000${item.imagen}`} alt={item.nombre} />
                  <span>{item.nombre}</span>
                </div>
              </td>
              <td>${item.precio.toLocaleString()}</td>
              <td>
                <input
                  type="number"
                  value={item.cantidad}
                  min="1"
                  onChange={(e) => actualizarCantidad(item.id, e.target.value)}
                />
              </td>
              <td>${(item.precio * item.cantidad).toLocaleString()}</td>
              <td>
                <button className="btn-eliminar" onClick={() => eliminarProducto(item.id)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Resumen del pedido */}
      <div className="resumen-pedido">
        <h3>Resumen del Pedido</h3>
        <div className="resumen-items">
          {carrito.map((item) => (
            <div key={item.id} className="resumen-item">
              <span>{item.nombre} x {item.cantidad}</span>
              <span>${(item.precio * item.cantidad).toLocaleString()}</span>
            </div>
          ))}
          <div className="resumen-total">
            <strong>Total:</strong>
            <strong>${total.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      <div className="carrito-total">
        {/* 🆕 BOTÓN WOMPI */}
        <button 
          className="btn-finalizar" 
          onClick={handlePagarConWompi}
          disabled={loading}
          style={{ 
            backgroundColor: "#7c3aed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          {loading ? "Procesando..." : "💳 Pagar con Wompi"}
        </button>

        <Link to="/" className="btn-seguir">
          Seguir comprando
        </Link>
      </div>

      {/* Métodos aceptados */}
      <div style={{ 
        marginTop: "20px", 
        padding: "15px", 
        backgroundColor: "#f0f0f0", 
        borderRadius: "8px",
        textAlign: "center"
      }}>
        <p style={{ margin: "0", color: "#666" }}>
          ✓ Nequi ✓ PSE ✓ Tarjeta ✓ Daviplata y más
        </p>
        <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#999" }}>
          Pago seguro con Wompi
        </p>
      </div>
    </div>
  );
}
