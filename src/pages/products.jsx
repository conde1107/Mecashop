//pages/products.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/products.css";
import AlertasVencimiento from "../components/AlertasVencimiento";

const API_URL = "http://localhost:3000/api/productos";

export default function Products() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState(""); //  campo de búsqueda
  const [paginaActual, setPaginaActual] = useState(1);
  const [productosPorPagina] = useState(6); //  cantidad por página
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    setIsLoggedIn(!!token);
    setUserRole(role);
  }, []);

  useEffect(() => {
    const fetchProductos = async () => {
      // Solo cargar productos si es cliente o no está logueado
      if (userRole && userRole !== "cliente") {
        setCargando(false);
        return;
      }

      try {
        const res = await fetch(API_URL);
        if (!res.ok) {
          throw new Error(`Error HTTP: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        const lista = Array.isArray(data) ? data : data.productos;
        if (!lista) throw new Error("No se encontraron productos en la respuesta.");
        setProductos(lista);
      } catch (error) {
        console.error(" Error al cargar productos:", error);
        setError(error.message);
      } finally {
        setCargando(false);
      }
    };

    fetchProductos();
  }, [userRole]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleVerProducto = (id) => {
    navigate(`/producto/${id}`);
  };

  //  Filtrar productos por nombre o categoría
  const productosFiltrados = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.categoria?.toLowerCase().includes(busqueda.toLowerCase())
  );

  //  Paginación
  const indiceUltimoProducto = paginaActual * productosPorPagina;
  const indicePrimerProducto = indiceUltimoProducto - productosPorPagina;
  const productosPaginados = productosFiltrados.slice(
    indicePrimerProducto,
    indiceUltimoProducto
  );

  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

  const cambiarPagina = (numero) => setPaginaActual(numero);

  return (
    <div className="products-container">
      {/* 📱 Alertas de vencimiento de documentos - DESHABILITADO, se muestra en el panel de notificaciones */}
      {/* {isLoggedIn && (
        <AlertasVencimiento 
          usuarioId={localStorage.getItem("userId")} 
          token={localStorage.getItem("token")}
        />
      )} */}

      {/* HERO */}
      <section className="products-hero">
        <video
          className="hero-video"
          src="/Carro.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="products-left">
          <h2>MecaShop</h2>
          <h1>Tu motor es nuestra pasión</h1>
          <p>Encuentra los mejores productos</p>
        </div>
      </section>

      {/* LISTA DE PRODUCTOS */}
      <section className="products-list">
        <h2>Productos Disponibles</h2>

        {/* Mostrar productos solo si es cliente o no está logueado */}
        {userRole && userRole !== "cliente" ? (
          <p style={{ textAlign: "center", fontSize: "18px", color: "#6b7280", marginTop: "40px" }}>
            Esta sección está disponible solo para clientes.
          </p>
        ) : (
          <>
            {/*  Campo de búsqueda */}
            <div className="busqueda-container">
              <input
                type="text"
                placeholder="Buscar por nombre o categoría..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {cargando ? (
              <p>Cargando productos...</p>
            ) : error ? (
              <p style={{ color: "red" }}> {error}</p>
            ) : productosFiltrados.length === 0 ? (
              <p>No hay productos disponibles.</p>
            ) : (
              <>
                <div className="product-grid">
                  {productosPaginados.map((producto) => (
                    <div
                      key={producto._id}
                      className="product-card"
                      onClick={() => handleVerProducto(producto._id)}
                      style={{ cursor: "pointer" }}
                    >
                      {producto.imagenURL ? (
                        <img
                          src={`http://localhost:3000${producto.imagenURL}`}
                          alt={producto.nombre}
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      ) : (
                        <img src="/placeholder.jpg" alt="Imagen no disponible" />
                      )}
                      <h3>{producto.nombre}</h3>
                      <p>${parseFloat(producto.precio).toLocaleString("es-CO")}</p>
                    </div>
                  ))}
                </div>

                {/*  Controles de paginación */}
                <div className="paginacion">
                  {Array.from({ length: totalPaginas }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => cambiarPagina(i + 1)}
                      className={paginaActual === i + 1 ? "activo" : ""}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* LOGIN / REGISTER */}
      <section className="newsletter-section">
        {!isLoggedIn ? (
          <>
            <h3>¿Quieres iniciar sesión o necesitas ayuda?</h3>
            <p>No te pierdas las últimas novedades de MecaShop.</p>
            <div className="auth-buttons">
              <button
                className="subscribe-button"
                onClick={() => navigate("/login")}
              >
                Iniciar sesión
              </button>
              <button
                className="subscribe-button"
                onClick={() => navigate("/ayuda")}
                style={{ marginLeft: "10px", backgroundColor: "#4CAF50" }}
              >
                Ayuda
              </button>
            </div>
          </>
        ) : (
          <>
            <h3>Ya estás conectado</h3>
            <p>Bienvenido de nuevo a MecaShop </p>
            <button className="subscribe-button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </>
        )}
      </section>

     

      <footer className="products-footer">
        © 2025 MecaShop. Todos los derechos reservados.
      </footer>
    </div>
  );
}
