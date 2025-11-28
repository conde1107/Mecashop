// pages/tiendaDashboard.jsx
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/tiendaDashboard.css';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TiendaDashboard = () => {
  const [infoTienda, setInfoTienda] = useState({
    nombre: 'Mi Tienda',
    descripcion: 'Bienvenido a nuestra tienda',
    telefono: '',
    email: '',
    imagen: '',
    ubicacion: "",
  });

  const [editandoInfo, setEditandoInfo] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [previewImagen, setPreviewImagen] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const token = localStorage.getItem("token");
  const tiendaId = localStorage.getItem("userId");

  const buildImgUrl = (img) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return img.startsWith("/") ? `${API_BASE}${img}` : `${API_BASE}/uploads/${img}`;
  };

  // =====================
  // Cargar información
  // =====================
  useEffect(() => {
    cargarInfoTienda();
  }, [tiendaId, token]);

  const cargarInfoTienda = async () => {
    if (!tiendaId || !token) return;

    try {
      const res = await fetch(`${API_BASE}/api/tienda/${tiendaId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Datos cargados del servidor:', data);
        if (data.usuario) {
          setInfoTienda({
            nombre: data.usuario.nombre || 'Mi Tienda',
            descripcion: data.usuario.descripcion || '',
            telefono: data.usuario.telefono || '',
            email: data.usuario.correo || '',
            imagen: data.usuario.imagen || '',
            ubicacion: data.usuario.zona || ""
          });
        }
      }
    } catch (error) {
      console.error('Error al cargar info tienda:', error);
      toast.error('Error al cargar información de la tienda');
    }
  };

  // =====================
  // Guardar info general
  // =====================
  const handleGuardarInfoTienda = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tienda/${tiendaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: infoTienda.nombre,
          descripcion: infoTienda.descripcion,
          telefono: infoTienda.telefono,
          email: infoTienda.email,
          ubicacion: infoTienda.ubicacion
        })
      });

      if (!res.ok) throw new Error('Error al guardar');

      const data = await res.json();
      console.log('Tienda guardada:', data);

      if (data.usuario) {
        setInfoTienda({
          nombre: data.usuario.nombre || 'Mi Tienda',
          descripcion: data.usuario.descripcion || '',
          telefono: data.usuario.telefono || '',
          email: data.usuario.email || data.usuario.correo || '',
          imagen: data.usuario.imagen || '',
          ubicacion: data.usuario.zona || ""
        });
      }

      setEditandoInfo(false);
      toast.success('Información de la tienda actualizada');
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar la información');
    }
  };

  // =====================
  // Manejo imagen
  // =====================
  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona un archivo de imagen");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 5MB");
      return;
    }

    setImagenSeleccionada(file);
    setPreviewImagen(URL.createObjectURL(file));
  };

  const subirImagen = async () => {
    if (!imagenSeleccionada) return toast.error("Selecciona una imagen primero");

    const formData = new FormData();
    formData.append("foto", imagenSeleccionada);

    try {
      setSubiendo(true);

      const res = await fetch(`${API_BASE}/api/tienda/${tiendaId}/foto`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (data.imagen) {
        setInfoTienda(prev => {
          const actualizado = { ...prev, imagen: data.imagen };
          localStorage.setItem("infoTienda", JSON.stringify(actualizado));
          return actualizado;
        });
        toast.success("Imagen actualizada correctamente");
      } else {
        toast.error("No se recibió la imagen actualizada");
      }

      setPreviewImagen(null);
      setImagenSeleccionada(null);

    } catch (err) {
      console.error("Error al subir imagen:", err);
      toast.error("Error al subir la imagen");
    } finally {
      setSubiendo(false);
    }
  };

  // =====================
  // Ubicación GPS
  // =====================
  const detectarUbicacion = () => {
    if (!navigator.geolocation) return toast.error("La geolocalización no está soportada");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const ubicacionStr = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

        setInfoTienda((prev) => ({
          ...prev,
          ubicacion: ubicacionStr
        }));

        toast.success("Ubicación detectada");
      },
      (err) => {
        console.error(err);
        toast.error("No se pudo obtener la ubicación");
      }
    );
  };

  return (
    <div className="tienda-dashboard-v2">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Panel de la Tienda</h1>
          <p>Gestiona tu tienda y catálogo de productos</p>
        </div>
      </div>

      {/* INFORMACIÓN DE TIENDA */}
      <div className="info-tienda-section">

        {editandoInfo ? (
          <div className="info-tienda-formulario">

            {/* Imagen */}
            <div className="form-group img-section">
              <label>Imagen de la tienda</label>

              {previewImagen ? (
                <img className="tienda-img" src={previewImagen} alt="Preview" />
              ) : infoTienda.imagen ? (
                <img className="tienda-img" src={buildImgUrl(infoTienda.imagen)} alt="Tienda" />
              ) : (
                <div className="no-img">Sin imagen</div>
              )}

              <input type="file" accept="image/*" onChange={handleImagenChange} />

              <button className="btn-guardar-info" onClick={subirImagen} disabled={subiendo}>
                {subiendo ? "Subiendo..." : "Subir Imagen"}
              </button>
            </div>

            <div className="form-group">
              <label>Nombre de la Tienda</label>
              <input
                type="text"
                value={infoTienda.nombre}
                onChange={(e) => setInfoTienda({ ...infoTienda, nombre: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                value={infoTienda.descripcion}
                onChange={(e) => setInfoTienda({ ...infoTienda, descripcion: e.target.value })}
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Ubicación (Coordenadas)</label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  type="text"
                  value={infoTienda.ubicacion}
                  placeholder="Latitud, Longitud"
                  onChange={(e) => setInfoTienda({ ...infoTienda, ubicacion: e.target.value })}
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn-guardar-info" onClick={detectarUbicacion}>
                  Detectar ubicación
                </button>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  value={infoTienda.telefono}
                  onChange={(e) => setInfoTienda({ ...infoTienda, telefono: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={infoTienda.email}
                  onChange={(e) => setInfoTienda({ ...infoTienda, email: e.target.value })}
                />
              </div>
            </div>

            <button className="btn-guardar-info" onClick={handleGuardarInfoTienda}>
              Guardar Cambios
            </button>
          </div>
        ) : (
          <div className="info-tienda-display">

            <div className="tienda-img-container">
              {infoTienda.imagen ? (
                <img className="tienda-img" src={buildImgUrl(infoTienda.imagen)} alt="Perfil tienda" />
              ) : (
                <div className="no-img">Sin imagen</div>
              )}
            </div>

            <button
              className={`btn-editar ${editandoInfo ? 'cancelar' : ''}`}
              onClick={() => setEditandoInfo(!editandoInfo)}
            >
              {editandoInfo ? 'Cancelar' : 'Editar'}
            </button>

            <div className="info-item">
              <span className="info-label">Nombre:</span>
              <span className="info-value">{infoTienda.nombre}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Descripción:</span>
              <span className="info-value">{infoTienda.descripcion}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Ubicación:</span>
              <span className="info-value">{infoTienda.ubicacion || "No establecida"}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Teléfono:</span>
              <span className="info-value">{infoTienda.telefono || 'No especificado'}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{infoTienda.email || 'No especificado'}</span>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default TiendaDashboard;
