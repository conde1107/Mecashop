// pages/productodetalle.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/productodetalle.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const buildImgUrl = (img) => {
  if (!img) return "/img/default-product.png";
  return img.startsWith("http") ? img : `${API_BASE}/uploads/${img}`;
};

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [calificaciones, setCalificaciones] = useState([]);
  const [estrella, setEstrella] = useState(0);
  const [comentario, setComentario] = useState("");

  const token = localStorage.getItem("token");

  //  Cargar producto y calificaciones
  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/productos/${id}`);
        const data = await res.json();
        setProducto(data);
      } catch (error) {
        console.error("Error cargando producto:", error);
      }
    };

    const fetchCalificaciones = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/calificacion-producto/${id}`);
        const data = await res.json();
        setCalificaciones(data);
      } catch (error) {
        console.error("Error cargando calificaciones:", error);
      }
    };

    fetchProducto();
    fetchCalificaciones();
  }, [id]);

  //  Agregar al carrito
  const agregarAlCarrito = () => {
    if (!token) {
      alert("Debes iniciar sesión primero para agregar productos al carrito");
      return;
    }

    if (!producto || !producto._id) {
      console.error("Producto inválido:", producto);
      alert("Error: no se pudo agregar el producto al carrito.");
      return;
    }

    try {
      let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      const index = carrito.findIndex((item) => item.id === producto._id);

      if (index !== -1) {
        carrito[index].cantidad = (carrito[index].cantidad || 1) + 1;
      } else {
        carrito.push({
          id: producto._id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagenURL,
          cantidad: 1,
        });
      }

      localStorage.setItem("carrito", JSON.stringify(carrito));
      console.log("Carrito actual:", carrito);
      alert("Producto agregado al carrito ");
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      alert("Error inesperado al agregar producto al carrito.");
    }
  };

  //  Enviar calificación
  const enviarCalificacion = async () => {
    if (!estrella) return alert("Selecciona una calificación");
    if (!token) return alert("Debes estar logueado para calificar");

    const nueva = { productoId: id, calificacion: estrella, comentario };

    try {
      const res = await fetch(`${API_BASE}/api/calificacion-producto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nueva),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error del servidor:", data);
        return alert(data.error || "Error al enviar calificación");
      }

      alert("Gracias por tu opinión!");
      setEstrella(0);
      setComentario("");

      // Recargar calificaciones
      const actualizar = await fetch(`${API_BASE}/api/calificacion-producto/${id}`);
      const calificacionesActualizadas = await actualizar.json();
      setCalificaciones(calificacionesActualizadas);
    } catch (error) {
      console.error("Error enviando calificación:", error);
      alert("Error en la conexión. Intenta de nuevo.");
    }
  };

  if (!producto) return <p>Cargando producto...</p>;

  return (
    <div className="detalle-container">
      <div className="detalle-card">
        <img
          src={buildImgUrl(producto.imagenURL)}
          alt={producto.nombre}
          className="detalle-imagen"
          onError={(e) => { e.target.src = "/img/default-product.png"; }}
        />

        <div className="detalle-info">
          <h2>{producto.nombre}</h2>
          <p>{producto.descripcion}</p>
          <h3 className="precio">${producto.precio.toLocaleString()}</h3>

          <button className="btn-agregar" onClick={agregarAlCarrito}>
            Agregar al carrito
          </button>

          <button className="btn-volver" onClick={() => navigate(-1)}>
            Volver atrás
          </button>
        </div>
      </div>

      <div className="calificacion-section">
        <h3>Calificar este producto</h3>

        <div className="estrellas">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={n <= estrella ? "estrella active" : "estrella"}
              onClick={() => setEstrella(n)}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          placeholder="Escribe un comentario..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />

        <button className="btn-calificar" onClick={enviarCalificacion}>
          Enviar calificación
        </button>

        <hr />

        <h3>Opiniones ({calificaciones.length})</h3>
        {calificaciones.length === 0 ? (
          <p>No hay comentarios aún</p>
        ) : (
          calificaciones.map((c, i) => (
            <div key={i} className="comentario-card">
              <div className="comentario-header">
                <strong>{c.usuarioId?.nombre || "Usuario Anónimo"}</strong>
                <span className="calificacion-stars">
                  {"★".repeat(c.calificacion)}
                </span>
              </div>
              {c.comentario && <p className="comentario-texto">{c.comentario}</p>}
              <small className="comentario-fecha">
                {new Date(c.fecha).toLocaleDateString("es-ES")}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductoDetalle;
