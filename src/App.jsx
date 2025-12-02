import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// 🔹 Componentes y páginas
import Header from "./components/header.jsx";
import Login from "./pages/login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Products from "./pages/products.jsx";
import ProductoDetalle from "./pages/productodetalle.jsx";
import Carrito from "./pages/carrito.jsx";
import Checkout from "./pages/Checkout.jsx";
import PagoExitoso from "./pages/PagoExitoso.jsx";
import MisOrdenes from "./pages/MisOrdenes.jsx";
import PerfilCliente from "./pages/perfilcliente.jsx";
import Directorio from "./pages/Directorio.jsx";
import VerPerfil from "./pages/verperfil.jsx";
import SolicitarCita from "./pages/solicitarcita.jsx";
import CalificarServicio from "./pages/calificarservicio.jsx";
import MisCitas from "./pages/miscitas.jsx";
import MisVehiculos from "./pages/misvehiculos.jsx";
import MecanicoDashboard from "./pages/mecanicoDashboard.jsx";
import CitasMecanico from "./pages/citasmecanico.jsx";
import Servicios from "./pages/servicios.jsx";
import TiendaDashboard from "./pages/tiendaDashboard.jsx";
import CalificacionesProductos from "./pages/calificacionesproductos.jsx";
import Catalogo from "./pages/catalogo.jsx";
import MecanicotiendaTienda from "./pages/mecanicotienda.jsx";
import Admin from "./pages/admin.jsx";
import Ayuda from "./pages/Ayuda.jsx";
import SolicitarAcceso from "./pages/SolicitarAcceso.jsx";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

  //  Verificar sesión al cargar
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    if (token && storedRole) {
      setLoggedIn(true);
      setRole(storedRole);
    }
  }, []);

  // Login handler
  const handleLogin = (userRole) => {
    setLoggedIn(true);
    setRole(userRole);
    localStorage.setItem("role", userRole);
  };

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setLoggedIn(false);
    setRole(null);
  };

  return (
    <BrowserRouter>
      <Header loggedIn={loggedIn} onLogout={handleLogout} />

      <Routes>
        {/* ======================= PÚBLICO ======================= */}
        <Route path="/" element={<Products />} />
        <Route path="/producto/:id" element={<ProductoDetalle />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/pago-exitoso" element={<PagoExitoso />} />
        <Route path="/ayuda" element={<Ayuda />} />
        <Route path="/solicitar-acceso" element={<SolicitarAcceso />} />

        {/* ======================= LOGIN ======================= */}
        <Route
          path="/login"
          element={
            !loggedIn ? (
              <Login onLogin={handleLogin} />
            ) : role === "admin" ? (
              <Navigate to="/admin" />
            ) : role === "mecanico" ? (
              <Navigate to="/mecanico-dashboard" />
            ) : role === "tienda" ? (
              <Navigate to="/tienda-dashboard" />
            ) : role === "cliente" ? (
              <Navigate to="/" />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* ======================= CLIENTE ======================= */}
        <Route
          path="/perfil-cliente"
          element={
            loggedIn && role === "cliente" ? (
              <PerfilCliente onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/directorio"
          element={
            loggedIn && role === "cliente" ? <Directorio /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/perfil/:id"
          element={
            loggedIn && role === "cliente" ? <VerPerfil /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/solicitar-cita"
          element={
            loggedIn && role === "cliente" ? <SolicitarCita /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/calificar-servicio"
          element={
            loggedIn && role === "cliente" ? <CalificarServicio /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/carrito"
          element={loggedIn && role === "cliente" ? <Carrito /> : <Navigate to="/login" />}
        />
        {/* 🔹 Nueva ruta para Mis Citas */}
        <Route
          path="/mis-citas"
          element={loggedIn && role === "cliente" ? <MisCitas /> : <Navigate to="/login" />}
        />
        {/* 🔹 Nueva ruta para Mis Vehículos */}
        <Route
          path="/mis-vehiculos"
          element={loggedIn && role === "cliente" ? <MisVehiculos /> : <Navigate to="/login" />}
        />
        {/* 🔹 Nueva ruta para Mis Órdenes */}
        <Route
          path="/mis-ordenes"
          element={loggedIn && role === "cliente" ? <MisOrdenes /> : <Navigate to="/login" />}
        />

        {/* ======================= MECÁNICO ======================= */}
        <Route
          path="/mecanico-dashboard"
          element={
            loggedIn && role === "mecanico" ? (
              <MecanicoDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/citas"
          element={loggedIn && role === "mecanico" ? <CitasMecanico /> : <Navigate to="/login" />}
        />
        <Route
          path="/servicios"
          element={loggedIn && role === "mecanico" ? <Servicios /> : <Navigate to="/login" />}
        />

        {/* ======================= TIENDA ======================= */}
        <Route
          path="/productos"
          element={loggedIn && role === "tienda" ? <TiendaDashboard onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/tienda-dashboard"
          element={loggedIn && role === "tienda" ? <TiendaDashboard onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/calificaciones-productos"
          element={loggedIn && role === "tienda" ? <CalificacionesProductos /> : <Navigate to="/login" />}
        />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route
          path="/mis-mecanicos"
          element={loggedIn && role === "tienda" ? <MecanicotiendaTienda /> : <Navigate to="/login" />}
        />

        {/* ======================= ADMIN ======================= */}
        <Route
          path="/admin"
          element={loggedIn && role === "admin" ? <Admin onLogout={handleLogout} /> : <Navigate to="/login" />}
        />

        {/* ======================= RUTA POR DEFECTO ======================= */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
