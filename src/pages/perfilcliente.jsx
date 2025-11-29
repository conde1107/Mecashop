// pages/perfilcliente.jsx
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/perfilcliente.css";

const API_URL = "http://localhost:3000/api";

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="pc-modal-overlay" onClick={onClose}>
      <div className="pc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pc-modal-header">
          <h4>{title}</h4>
          <button className="pc-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="pc-modal-body">{children}</div>
      </div>
    </div>
  );
}

export default function PerfilCliente() {
  const [perfil, setPerfil] = useState({
    nombre: "",
    correo: "",
    descripcion: "",
    imagen: "",
    telefono: "",
    zona: "",
    lat: null,
    lng: null,
  });

  const [editando, setEditando] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [loadingPerfil, setLoadingPerfil] = useState(true);

  const token = localStorage.getItem("token");
  if (!token && typeof window !== "undefined") window.location.href = "/login";

  // ============================
  // Cargar perfil
  // ============================
  const cargarPerfil = async () => {
    setLoadingPerfil(true);
    try {
      const res = await fetch(`${API_URL}/usuario/perfil`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setPerfil(data);
      else setPerfil(data);
    } catch (err) {
      console.error("Error al cargar perfil:", err);
      toast.error("Error al cargar perfil");
    } finally {
      setLoadingPerfil(false);
    }
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  // ============================
  // Selección y preview de foto
  // ============================
  const handleSeleccionarFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Debe ser una imagen");
    if (file.size > 5 * 1024 * 1024) return toast.error("La imagen debe ser menor a 5MB");

    setFotoSeleccionada(file);
    setPreviewFoto(URL.createObjectURL(file));
  };

  const subirFotoPerfil = async () => {
    if (!fotoSeleccionada) return toast.warning("Selecciona una foto primero");

    const formData = new FormData();
    formData.append("foto", fotoSeleccionada);

    try {
      setSubiendoFoto(true);
      const res = await fetch(`${API_URL}/usuario/perfil`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Foto actualizada");
        const usuarioActualizado = data.usuario || data;
        setPerfil((prev) => ({
          ...prev,
          imagen: usuarioActualizado.imagen || prev.imagen,
        }));
        setFotoSeleccionada(null);
        if (previewFoto) URL.revokeObjectURL(previewFoto);
        setPreviewFoto(null);
      } else toast.error(data.message || data.error || "No se pudo subir la foto");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error de conexión");
    } finally {
      setSubiendoFoto(false);
    }
  };

  // ============================
  // Guardar cambios de perfil
  // ============================
  const handleGuardarPerfil = async (e) => {
    e && e.preventDefault();

    const payload = {
      nombre: perfil.nombre || "",
      correo: perfil.correo || "",
      descripcion: perfil.descripcion || "",
      telefono: perfil.telefono || "",
      zona: perfil.zona || "",
    };

    if (perfil.lat && perfil.lng) {
      payload.ubicacion = { lat: perfil.lat, lng: perfil.lng };
    }

    try {
      const res = await fetch(`${API_URL}/usuario/perfil`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Perfil actualizado");
        setEditando(false);
      } else toast.error(data.message || data.error || "Error al guardar");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error de conexión");
    }
  };

  // ============================
  // Detectar ubicación
  // ============================
  const detectarUbicacion = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalización no soportada");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const zonaTexto = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setPerfil((prev) => ({ ...prev, zona: zonaTexto, lat: latitude, lng: longitude }));
        toast.success("Ubicación detectada correctamente");
      },
      (error) => {
        console.error(error);
        toast.error("No se pudo obtener la ubicación");
      },
      { enableHighAccuracy: true }
    );
  };

  // ============================
  // Render
  // ============================
  return (
    <div className="perfil-container">
      <ToastContainer position="top-center" autoClose={2500} />

      {loadingPerfil ? (
        <div className="perfil-loading">
          <div className="spinner"></div>
          <p>Cargando perfil...</p>
        </div>
      ) : (
        <section className="perfil-section">
          <div className="perfil-card-new">
            <div className="perfil-foto-section">
              <div className="perfil-foto-wrapper">
                {previewFoto ? (
                  <img src={previewFoto} alt="Preview" className="perfil-foto-grande" />
                ) : perfil.imagen ? (
                  <img src={perfil.imagen} alt="Foto" className="perfil-foto-grande" />
                ) : (
                  <div className="perfil-foto-placeholder-grande">👤</div>
                )}
              </div>

              <div className="perfil-button-section">
                <label htmlFor="input-foto" className="btn-cambiar-imagen">
                  Cambiar Imagen
                </label>
                <input
                  id="input-foto"
                  type="file"
                  accept="image/*"
                  onChange={handleSeleccionarFoto}
                  className="input-file-oculto"
                />
                {fotoSeleccionada && (
                  <button className="btn-subir-foto" onClick={subirFotoPerfil} disabled={subiendoFoto}>
                    {subiendoFoto ? "Subiendo..." : "Confirmar"}
                  </button>
                )}
              </div>
            </div>

            <div className="perfil-info-section">
              <div className="perfil-nombre-grande">{perfil.nombre}</div>
              <div className="perfil-datos">
                <p className="dato-simple">{perfil.correo}</p>
                <p className="dato-simple">{perfil.telefono || "Sin teléfono"}</p>
                <p className="dato-simple">{perfil.descripcion || "Sin descripción"}</p>
                <p className="dato-simple">Zona: {perfil.zona || "Sin zona registrada"}</p>
              </div>

              <div className="perfil-botones">
                <button type="button" className="btn-editar-info" onClick={() => setEditando(!editando)}>
                  {editando ? "✕ Cerrar" : " Editar Información"}
                </button>
              </div>

              {editando && (
                <form className="perfil-form-modal" onSubmit={handleGuardarPerfil}>
                  <div className="form-section">
                    <div className="form-group-modal">
                      <label>Nombre</label>
                      <input
                        type="text"
                        className="input-modal"
                        value={perfil.nombre}
                        onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group-modal">
                      <label>Correo</label>
                      <input
                        type="email"
                        className="input-modal"
                        value={perfil.correo}
                        onChange={(e) => setPerfil({ ...perfil, correo: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group-modal">
                      <label>Teléfono</label>
                      <input
                        type="tel"
                        className="input-modal"
                        value={perfil.telefono || ""}
                        onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })}
                        placeholder="Ej: +57 300 1234567"
                      />
                    </div>

                    <div className="form-group-modal">
                      <label>Descripción</label>
                      <textarea
                        className="textarea-modal"
                        value={perfil.descripcion}
                        onChange={(e) => setPerfil({ ...perfil, descripcion: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="form-group-modal">
                      <label>Zona/Ubicación</label>
                      <div className="zona-input-group">
                        <input
                          type="text"
                          className="input-modal"
                          value={perfil.zona || ""}
                          onChange={(e) => setPerfil({ ...perfil, zona: e.target.value })}
                          placeholder="Tu zona de cobertura"
                        />
                        <button type="button" className="btn-detectar" onClick={detectarUbicacion}>
                          📍 Detectar
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-buttons-modal">
                    <button type="submit" className="btn-guardar-modal">Guardar Cambios</button>
                    <button type="button" className="btn-cancelar-modal" onClick={() => setEditando(false)}>Cancelar</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
