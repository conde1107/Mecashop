import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/directorio.css";

const API_URL = "http://localhost:3000/api/directorio";

const Directorio = () => {
  const [talleres, setTalleres] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");
  const [cargando, setCargando] = useState(true);

  const especialidades = ["latonero", "pintura", "electrico"];

  const [filtros, setFiltros] = useState({
    rol: "todos",
    distancia: "",
    estado: "",
    especialidad: "",
  });

  const navigate = useNavigate();

  // Debounce de búsqueda
  useEffect(() => {
    const timeout = setTimeout(() => {
      setBusquedaDebounced(busqueda.trim());
    }, 500);
    return () => clearTimeout(timeout);
  }, [busqueda]);

  // Resetear filtros al cambiar rol
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "rol") {
      setFiltros({ rol: value, distancia: "", estado: "", especialidad: "" });
    } else {
      setFiltros({ ...filtros, [name]: value });
    }
  };

  // Cargar talleres según filtros
  useEffect(() => {
    const cargarTalleres = async () => {
      setCargando(true);
      try {
        const params = new URLSearchParams();

        if (filtros.rol !== "todos") params.append("rol", filtros.rol);
        if (busquedaDebounced) params.append("nombre", busquedaDebounced);

        // Filtros para mecánico
        if (filtros.rol === "mecanico") {
          if (filtros.estado) params.append("estado", filtros.estado);
          if (filtros.especialidad) params.append("especialidad", filtros.especialidad);
        }

        // Filtros para tienda
        if (filtros.rol === "tienda" && filtros.distancia) {
          params.append("distancia", filtros.distancia);
        }

        const res = await fetch(`${API_URL}?${params.toString()}`);
        const data = await res.json();

        // Validar que cada taller tenga los campos esperados
        const talleresNormalizados = data.map((t) => ({
          ...t,
          horario: t.horario || "No registrado",
          disponible: typeof t.disponible === "boolean" ? t.disponible : true,
        }));

        setTalleres(talleresNormalizados);
      } catch (error) {
        console.error("Error al cargar directorio:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarTalleres();
  }, [busquedaDebounced, filtros]);

  const handleVerPerfil = (id) => {
    navigate(`/perfil/${id}`);
  };

  return (
    <div className="directorio-container">
      <h1>Directorio</h1>

      {/*  Búsqueda y rol */}
      <div className="busqueda-container">
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select name="rol" value={filtros.rol} onChange={handleChange}>
          <option value="todos">Todos</option>
          <option value="mecanico">Mecánicos</option>
          <option value="tienda">Tiendas</option>
        </select>
      </div>

      {/* 🔹 Filtros MECÁNICO */}
      {filtros.rol === "mecanico" && (
        <div className="filtros-container">
          <div className="filtro">
            <label>Disponibilidad:</label>
            <select name="estado" value={filtros.estado} onChange={handleChange}>
              <option value="">Todas</option>
              <option value="Disponible">Disponible</option>
              <option value="Pausado">Pausado</option>
            </select>
          </div>
          <div className="filtro">
            <label>Especialidad:</label>
            <select name="especialidad" value={filtros.especialidad} onChange={handleChange}>
              <option value="">Todas</option>
              {especialidades.map((e) => (
                <option key={e} value={e}>
                  {e.charAt(0).toUpperCase() + e.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 🔹 Filtro TIENDAS */}
      {filtros.rol === "tienda" && (
        <div className="filtros-container">
          <div className="filtro">
            <label>Ordenar por distancia:</label>
            <select name="distancia" value={filtros.distancia} onChange={handleChange}>
              <option value="">-- Seleccionar --</option>
              <option value="cerca">Más cerca</option>
              <option value="lejos">Más lejos</option>
            </select>
          </div>
        </div>
      )}

      {/* Resultados */}
      {cargando ? (
        <p className="no-resultados">Cargando directorio...</p>
      ) : talleres.length > 0 ? (
        <div className="resultados-container">
          {talleres.map((t) => (
            <div key={t._id} className="taller-card">
             <img
  src={t.imagen ? t.imagen : "/img/default-user.png"}
  alt={t.nombre}
/>

              <div className="taller-info">
                <h3>{t.nombre}</h3>
                <p><strong>Rol:</strong> {t.rol}</p>
                <p><strong>Teléfono:</strong> {t.telefono || "No disponible"}</p>
                <p><strong>Dirección:</strong> {t.direccion || "No registrada"}</p>

                {/* Mostrar horario y disponibilidad para mecánicos */}
                {t.rol === "mecanico" && (
                  <>
                    <p><strong>Disponibilidad:</strong> {t.disponible ? "Disponible" : "Pausado"}</p>
                    <p><strong>Horario:</strong> {t.horario}</p>
                  </>
                )}

                <button className="btn-ver-perfil" onClick={() => handleVerPerfil(t._id)}>
                  Ver perfil
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-resultados">No se encontraron resultados.</p>
      )}
    </div>
  );
};

export default Directorio;
