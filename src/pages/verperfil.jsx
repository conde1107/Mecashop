import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/verperfil.css";

const API_URL = "http://localhost:3000/api/directorio";

const VerPerfil = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        console.log("[VerPerfil] Fetching ID:", id);
        const url = `${API_URL}/${id}`;
        console.log("[VerPerfil] URL:", url);
        
        const res = await fetch(url);
        console.log("[VerPerfil] Response status:", res.status, res.statusText);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("[VerPerfil] Error response:", errorText);
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log("[VerPerfil] Data received:", data);
        setPerfil(data);
        setError(null);
      } catch (err) {
        console.error("[VerPerfil] Error:", err.message);
        setError(err.message || "Error al cargar el perfil");
        setPerfil(null);
      } finally {
        setCargando(false);
      }
    };

    fetchPerfil();
  }, [id]);

  if (cargando)
    return (
      <div className="perfil-container">
        <p className="loading">⏳ Cargando perfil...</p>
      </div>
    );

  if (error)
    return (
      <div className="perfil-container">
        <p className="error">❌ {error}</p>
        <button className="btn-volver" onClick={() => navigate(-1)}>⬅ Volver</button>
      </div>
    );

  if (!perfil)
    return (
      <div className="perfil-container">
        <p className="error">❌ Perfil no encontrado.</p>
        <button className="btn-volver" onClick={() => navigate(-1)}>⬅ Volver</button>
      </div>
    );

  // Construir URL correcta para imagen o PDF
  const buildUrl = (path) => {
    if (!path) return null;
    return path.startsWith("http") ? path : `http://localhost:3000${path}`;
  };

  return (
    <div className="perfil-container">
      <button className="btn-volver" onClick={() => navigate(-1)}>⬅ Volver</button>
      
      <div className="perfil-header">
        {perfil.imagen && (
          <img
            src={buildUrl(perfil.imagen)}
            alt={perfil.nombre}
            className="perfil-imagen"
          />
        )}
        <div className="perfil-info-principal">
          <h1>{perfil.nombre}</h1>
          <p className="perfil-rol">{perfil.rol === "mecanico" ? "Mecánico" : "Tienda"}</p>
        </div>
      </div>

      <div className="perfil-detalles">
        {perfil.descripcion && (
          <div className="detalle-item">
            <strong>Descripción:</strong>
            <p>{perfil.descripcion}</p>
          </div>
        )}

        {perfil.telefono && (
          <div className="detalle-item">
            <strong>📞 Teléfono:</strong>
            <p>{perfil.telefono}</p>
          </div>
        )}

        {perfil.correo && (
          <div className="detalle-item">
            <strong>📧 Correo:</strong>
            <p>{perfil.correo}</p>
          </div>
        )}

        {perfil.rol === "mecanico" ? (
          <>
            {perfil.especialidad && (
              <div className="detalle-item">
                <strong>🔧 Especialidad:</strong>
                <p>{perfil.especialidad}</p>
              </div>
            )}

            {perfil.zona && (
              <div className="detalle-item">
                <strong>📍 Zona:</strong>
                <p>{perfil.zona}</p>
              </div>
            )}

            <div className="detalle-item">
              <strong>Estado:</strong>
              <p className={perfil.disponible ? "disponible" : "pausado"}>
                {perfil.disponible ? "✅ Disponible" : "⏸️ Pausado"}
              </p>
            </div>
          </>
        ) : (
          <>
            {perfil.direccion && (
              <div className="detalle-item">
                <strong>📍 Dirección:</strong>
                <p>{perfil.direccion}</p>
              </div>
            )}
          </>
        )}

        {perfil.certificacionPdf && (
          <div className="detalle-item">
            <strong>📄 Certificación:</strong>
            <a 
              href={buildUrl(perfil.certificacionPdf)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-certificacion"
            >
              Ver PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerPerfil;
