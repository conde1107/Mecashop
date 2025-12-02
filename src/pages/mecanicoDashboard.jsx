import React, { useState, useEffect } from "react";
import "../styles/mecanicoDashboard.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const MecanicoDashboard = () => {
  const [perfil, setPerfil] = useState({
    nombre: "",
    correo: "",
    descripcion: "",
    telefono: "",
    zona: "",
    horario: "", 
    disponibilidad: "",
    imagen: "",
    activo: true,
    disponible: true,
    especialidad: "",
  });

  const [perfilEditado, setPerfilEditado] = useState({
    descripcion: "",
    telefono: "",
    zona: "",
    horario: "", // Campo horario editable
    ubicacion: null,
  });

  const [banco, setBanco] = useState({
    nombreBanco: "",
    tipoCuenta: "",
    numeroCuenta: "",
  });

  const [servicios, setServicios] = useState([]);
  const [nuevoServicio, setNuevoServicio] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
  });

  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [previewImagen, setPreviewImagen] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);

  const token = localStorage.getItem("token");
  const mecanicoId = localStorage.getItem("userId");

  // ===========================
  // Fetch centralizado
  // ===========================
  const apiFetch = async (url, options = {}) => {
    const headers = options.headers || {};
    if (token && !(options.body instanceof FormData)) {
      headers["Authorization"] = `Bearer ${token}`;
      if (!headers["Content-Type"] && options.json !== false) {
        headers["Content-Type"] = "application/json";
      }
    } else if (token && options.body instanceof FormData) {
      headers["Authorization"] = `Bearer ${token}`;
      delete headers["Content-Type"];
    }

    const fetchOptions = { ...options, headers };
    const res = await fetch(url, fetchOptions);
    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  };

  const buildImgUrl = (img) => {
  if (!img) return null;
  // Si la imagen ya es una URL completa (Cloudinary), la usamos tal cual
  return img.startsWith("http") ? img : `${API_BASE}/uploads/${img}`;
};

  // ===========================
  // Cargar datos del mecánico
  // ===========================
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const cargarDatos = async () => {
      if (!token || !mecanicoId) {
        setCargando(false);
        return;
      }

      try {
        const dataPerfil = await apiFetch(`${API_BASE}/api/usuario/perfil`, { signal, json: false });
        if (dataPerfil) {
          setPerfil({
            nombre: dataPerfil.nombre || "",
            correo: dataPerfil.correo || "",
            descripcion: dataPerfil.descripcion || "",
            telefono: dataPerfil.telefono || "",
            zona: dataPerfil.zona || "",
            horario: dataPerfil.horario || "", // horario editable
            disponibilidad: dataPerfil.disponibilidad || "",
            imagen: dataPerfil.imagen || "",
            activo: dataPerfil.activo ?? true,
            disponible: typeof dataPerfil.disponible === "boolean" ? dataPerfil.disponible : true,
            especialidad: dataPerfil.especialidad || "",
          });

          setPerfilEditado({
            descripcion: dataPerfil.descripcion || "",
            telefono: dataPerfil.telefono || "",
            zona: dataPerfil.zona || "",
            horario: dataPerfil.horario || "", // horario editable
            ubicacion: dataPerfil.ubicacion || null,
          });
        }

        const bancoData = await apiFetch(`${API_BASE}/api/mecanicos/${mecanicoId}/banco`);
        if (bancoData) setBanco(bancoData);

        const serviciosData = await apiFetch(`${API_BASE}/api/mecanicos/${mecanicoId}/ofertas`);
        if (Array.isArray(serviciosData)) setServicios(serviciosData);
      } catch (error) {
        console.error("Error al cargar datos del mecánico:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
    return () => controller.abort();
  }, [token, mecanicoId]);

  // ===========================
  // Imagen de perfil
  // ===========================
const handleImagenChange = (e) => {
  const file = e.target.files[0];
  if (!file) {
    console.log("No se seleccionó ningún archivo");
    return;
  }

  console.log("Archivo seleccionado:", file);
  console.log("Tipo:", file.type);
  console.log("Tamaño:", file.size);

  if (!file.type.startsWith("image/"))
    return alert("Selecciona un archivo de imagen");

  if (file.size > 5 * 1024 * 1024)
    return alert("La imagen debe ser menor a 5MB");

  setImagenSeleccionada(file);
  setPreviewImagen(URL.createObjectURL(file));
};

const subirImagen = async () => {
  if (!imagenSeleccionada) return alert("Selecciona una imagen primero");

  const formData = new FormData();
  formData.append("foto", imagenSeleccionada);

  // Debug
  for (let pair of formData.entries()) {
    console.log("FormData key:", pair[0], "value:", pair[1]);
  }

  try {
    setSubiendoImagen(true);

    const res = await fetch(`${API_BASE}/api/mecanicos/${mecanicoId}/foto`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`, // si usas token de autenticación
      },
      body: formData, 
    });

    const data = await res.json();

    if (res.ok) {
      alert(" Imagen actualizada correctamente");
      setPerfil((prev) => ({ ...prev, imagen: data.imagen || prev.imagen }));
      setImagenSeleccionada(null);
      if (previewImagen) URL.revokeObjectURL(previewImagen);
      setPreviewImagen(null);
    } else {
      alert(data.message || "❌ No se pudo subir la imagen");
    }
  } catch (error) {
    console.error("Error al subir imagen:", error);
    alert(" Error de conexión");
  } finally {
    setSubiendoImagen(false);
  }
};

  // ===========================
  // Editar perfil
  // ===========================
  const handlePerfilChange = (e) => {
    const { name, value } = e.target;
    setPerfilEditado({ ...perfilEditado, [name]: value });
  };

  const detectarUbicacion = () => {
    if (!navigator.geolocation) return alert("Geolocalización no soportada");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPerfilEditado((prev) => ({
          ...prev,
          zona: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          ubicacion: { lat: latitude, lng: longitude },
        }));
        alert("Ubicación detectada y añadida al formulario");
      },
      () => alert("No se pudo detectar la ubicación")
    );
  };

  const guardarCambiosPerfil = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...perfilEditado, 
        telefono: perfilEditado.telefono?.trim(),
        horario: perfilEditado.horario?.trim(), // incluir horario
      };
      const data = await apiFetch(`${API_BASE}/api/usuario/perfil`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const usuarioActualizado = data.usuario || data;
      setPerfil((prev) => ({ ...prev, ...usuarioActualizado }));
      setEditando(false);
      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      alert(" No se pudo actualizar el perfil");
    }
  };

  // ===========================
  // Toggle disponibilidad
  // ===========================
  const toggleDisponibilidad = async () => {
    try {
      const nuevoValor = !perfil.disponible;
      const data = await apiFetch(`${API_BASE}/api/mecanicos/${mecanicoId}/disponible`, {
        method: "PUT",
        body: JSON.stringify({ disponible: nuevoValor }),
      });

      if (data && typeof data.disponible === "boolean") {
        setPerfil((prev) => ({ ...prev, disponible: data.disponible }));
        alert(data.mensaje || " Disponibilidad actualizada");
      } else {
        setPerfil((prev) => ({ ...prev, disponible: nuevoValor }));
        alert(" Disponibilidad actualizada");
      }
    } catch (error) {
      console.error("Error al cambiar disponibilidad:", error);
      setPerfil((prev) => ({ ...prev, disponible: !prev.disponible }));
      alert(" No se pudo cambiar la disponibilidad");
    }
  };

  // ===========================
  // Datos bancarios
  // ===========================
  const handleBancoChange = (e) => {
    const { name, value } = e.target;
    setBanco({ ...banco, [name]: value });
  };

  const guardarBanco = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch(`${API_BASE}/api/mecanicos/${mecanicoId}/banco`, {
        method: "PUT",
        body: JSON.stringify(banco),
      });
      setBanco(data);
      alert(" Datos bancarios guardados correctamente");
    } catch (error) {
      console.error("Error al guardar datos bancarios:", error);
      alert(" No se pudieron guardar los datos bancarios");
    }
  };

  // ===========================
  // Servicios
  // ===========================
  const handleServicioChange = (e) => {
    const { name, value } = e.target;
    setNuevoServicio({ ...nuevoServicio, [name]: value });
  };

  const agregarServicio = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: nuevoServicio.nombre,
        descripcion: nuevoServicio.descripcion,
        precioEstimado: Number(nuevoServicio.precio) || 0,
        negociable: false,
      };
      const data = await apiFetch(`${API_BASE}/api/mecanicos/${mecanicoId}/ofertas`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const oferta = data.oferta || data;
      setServicios((prev) => [...prev, oferta]);
      setNuevoServicio({ nombre: "", descripcion: "", precio: "" });
      alert(" Servicio agregado correctamente");
    } catch (error) {
      console.error("Error al agregar servicio:", error);
      alert(" No se pudo agregar el servicio");
    }
  };

  const eliminarServicio = async (id) => {
    try {
      if (!window.confirm("¿Eliminar servicio? Esta acción no se puede deshacer.")) return;
      await apiFetch(`${API_BASE}/api/mecanicos/${mecanicoId}/ofertas/${id}`, { method: "DELETE" });
      setServicios((prev) => prev.filter((s) => s._id !== id));
      alert(" Servicio eliminado");
    } catch (error) {
      console.error("Error al eliminar servicio:", error);
      alert("❌ No se pudo eliminar el servicio");
    }
  };

  if (cargando) return <p className="loading">Cargando datos...</p>;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Panel del Mecánico</h2>

      {/* PERFIL */}
      <section className="perfil-section">
        <div className="perfil-header">
          <div className="perfil-img-container">
            {previewImagen ? (
          <img className="perfil-img" src={previewImagen} alt="Preview" />
          ) : perfil.imagen ? (
                       <img className="perfil-img" src={buildImgUrl(perfil.imagen)} alt="Perfil" />
                ) : (
              <div className="no-img">Sin imagen</div>
                              )}

            <div className="img-upload">
              <input type="file" accept="image/*" onChange={handleImagenChange} />
              <button onClick={subirImagen} disabled={subiendoImagen} className="btn save">
                {subiendoImagen ? "Subiendo..." : "Subir Imagen"}
              </button>
            </div>
          </div>

          <div className="perfil-info">
            <div className="perfil-top">
              <div>
                <h3 className="perfil-nombre">{perfil.nombre}</h3>
                <p className="perfil-correo">{perfil.correo}</p>
              </div>
              <div className="perfil-actions">
                <button className="btn toggle" onClick={toggleDisponibilidad}>
                  {perfil.disponible ? "Pausar" : "Reactivar"}
                </button>
                <button className="btn edit" onClick={() => setEditando(true)}>
                  Editar
                </button>
              </div>
            </div>

            <p className="perfil-desc">{perfil.descripcion || "Sin descripción"}</p>
            <div className="perfil-meta">
              <span>📞 {perfil.telefono || "No registrado"}</span>
              <span>📍 {perfil.zona || "Sin zona"}</span>
              <span>🕓 {perfil.horario || "Sin horario"}</span>
            </div>

            <p className="perfil-estado">
              Estado:{" "}
              <span className={`estado ${perfil.disponible ? "activo" : "inactivo"}`}>
                {perfil.disponible ? "Activo" : "Pausado"}
              </span>
            </p>
          </div>
        </div>

        {editando && (
          <form onSubmit={guardarCambiosPerfil} className="perfil-form">
            <textarea
              name="descripcion"
              placeholder="Descripción"
              value={perfilEditado.descripcion}
              onChange={handlePerfilChange}
            />
            <input
              type="text"
              name="telefono"
              placeholder="Teléfono"
              value={perfilEditado.telefono}
              onChange={handlePerfilChange}
            />
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="text"
                name="zona"
                placeholder="Zona (puedes detectar ubicación)"
                value={perfilEditado.zona}
                onChange={handlePerfilChange}
                style={{ flex: 1 }}
              />
              <button type="button" className="btn" onClick={detectarUbicacion}>
                Detectar ubicación
              </button>
            </div>
            <input
              type="text"
              name="horario"
              placeholder="Horario disponible"
              value={perfilEditado.horario}
              onChange={handlePerfilChange}
            />
            <div className="perfil-buttons">
              <button type="submit" className="btn guardar-rojo">Guardar</button>
              <button type="button" className="btn cancel" onClick={() => setEditando(false)}>Cancelar</button>
            </div>
          </form>
        )}
      </section>

      {/* DATOS BANCARIOS */}
      <section className="banco-section">
        <h3>Datos Bancarios</h3>
        <form onSubmit={guardarBanco}>
          <input
            type="text"
            name="nombreBanco"
            placeholder="Nombre del banco"
            value={banco.nombreBanco}
            onChange={handleBancoChange}
          />
          <select name="tipoCuenta" value={banco.tipoCuenta} onChange={handleBancoChange}>
            <option value="">Selecciona tipo de cuenta</option>
            <option value="Ahorros">Ahorros</option>
            <option value="Corriente">Corriente</option>
          </select>
          <input
            type="text"
            name="numeroCuenta"
            placeholder="Número de cuenta"
            value={banco.numeroCuenta}
            onChange={handleBancoChange}
          />
          <button type="submit" className="btn save">Guardar Datos</button>
        </form>
      </section>

      {/* SERVICIOS */}
      <section className="servicios-section">
        <h3>Servicios que ofrezco</h3>
        <form onSubmit={agregarServicio}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del servicio"
            value={nuevoServicio.nombre}
            onChange={handleServicioChange}
          />
          <textarea
            name="descripcion"
            placeholder="Descripción"
            value={nuevoServicio.descripcion}
            onChange={handleServicioChange}
          />
          <input
            type="number"
            name="precio"
            placeholder="Precio"
            value={nuevoServicio.precio}
            onChange={handleServicioChange}
          />
          <button type="submit" className="btn save">Agregar Servicio</button>
        </form>

        <div className="servicios-lista">
          {servicios.length === 0 ? (
            <p>No has agregado servicios aún.</p>
          ) : (
            servicios.map((s) => (
              <div key={s._id} className="servicio-card">
                <h4>{s.nombre || s.nombreServicio}</h4>
                <p>{s.descripcion || "Sin descripción"}</p>
                <p><strong>Precio:</strong> ${s.precioEstimado ?? s.precio ?? 0}</p>
                <button className="btn cancel" onClick={() => eliminarServicio(s._id)}>Eliminar</button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};


export default MecanicoDashboard;
