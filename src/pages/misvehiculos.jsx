// src/pages/MisVehiculos.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/misvehiculos.css";
import Modal from "../components/Modal";
import AlertasVencimiento from "../components/AlertasVencimiento";

const API_URL = "http://localhost:3000/api";
const API_BASE = "http://localhost:3000";

const buildImgUrl = (img) => {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return img.startsWith("/") ? `${API_BASE}${img}` : `${API_BASE}/uploads/${img}`;
};

export default function MisVehiculos() {
  const location = useLocation();
  const [vehiculos, setVehiculos] = useState([]);
  const [serviciosPorVehiculo, setServiciosPorVehiculo] = useState({}); // Servicios completados por vehiculoId
  const [mantenimientosPorVehiculo, setMantenimientosPorVehiculo] = useState({}); // Mantenimientos por vehiculoId
  const [nuevoVehiculo, setNuevoVehiculo] = useState({ marca: "", modelo: "", placa: "", color: "", kilometraje: "", combustible: "Gasolina", tipoUso: "diario", tipoAceite: "sintético", usoEspecial: "normal", fechaCompraSoat: "", fechaCompraTeconomecanica: "" });
  const [imagenVehiculo, setImagenVehiculo] = useState(null);
  const [previewVehiculo, setPreviewVehiculo] = useState(null);

  const [loadingVehiculos, setLoadingVehiculos] = useState(true);

  const [docModalOpen, setDocModalOpen] = useState(false);
  const [kmModalOpen, setKmModalOpen] = useState(false);
  const [fechasModalOpen, setFechasModalOpen] = useState(false);
  const [mantenimientosModalOpen, setMantenimientosModalOpen] = useState(false);
  const [activeVehicle, setActiveVehicle] = useState(null);

  const [formDocs, setFormDocs] = useState({ soat: null, tecnomecanica: null });
  const [formKm, setFormKm] = useState({ nuevoKilometraje: "", combustible: "", tipoAceite: "", color: "", usoEspecial: "" });
  const [formFechas, setFormFechas] = useState({ 
    fechaCompraSoat: "", 
    fechaCompraTeconomecanica: "" 
  });

  const token = localStorage.getItem("token");
  if (!token) {
    if (typeof window !== "undefined") window.location.href = "/login";
  }

  const cargarVehiculos = async () => {
    setLoadingVehiculos(true);
    try {
      const res = await fetch(`${API_URL}/vehiculo`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      console.log("✅ Vehículos cargados:", data);
      if (res.ok) {
        setVehiculos(data);
        // Cargar servicios y mantenimientos completados para cada vehículo
        data.forEach(v => {
          console.log(`📍 Vehículo ID: ${v._id}, Marca: ${v.marca}, Modelo: ${v.modelo}`);
          cargarServiciosPorVehiculo(v._id);
          cargarMantenimientosPorVehiculo(v._id);
        });
      }
    } catch (err) {
      toast.error("Error al cargar vehículos");
      console.error("Error cargando vehículos:", err);
    } finally {
      setLoadingVehiculos(false);
    }
  };

  // Cargar servicios completados de un vehículo
  const cargarServiciosPorVehiculo = async (vehiculoId) => {
    try {
      console.log(`🚗 Cargando servicios para vehículo: ${vehiculoId}`);
      const res = await fetch(`${API_URL}/servicios/vehiculo/${vehiculoId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (!res.ok) {
        console.error(`❌ Error ${res.status}: ${res.statusText}`);
        return;
      }
      
      const data = await res.json();
      console.log(`📦 Servicios cargados para vehículo ${vehiculoId}:`, data);
      
      if (Array.isArray(data) && data.length > 0) {
        setServiciosPorVehiculo(prev => ({
          ...prev,
          [vehiculoId]: data
        }));
      } else {
        console.log(`ℹ️ Sin servicios completados para vehículo ${vehiculoId}`);
      }
    } catch (err) {
      console.error("❌ Error cargando servicios:", err);
    }
  };

  // Cargar mantenimientos de un vehículo
  const cargarMantenimientosPorVehiculo = async (vehiculoId) => {
    try {
      console.log(`🔧 Cargando mantenimientos para vehículo: ${vehiculoId}`);
      const res = await fetch(`${API_URL}/mantenimiento/vehiculo/${vehiculoId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (!res.ok) {
        console.error(`❌ Error ${res.status}: ${res.statusText}`);
        return;
      }
      
      const data = await res.json();
      console.log(`📋 Mantenimientos cargados para vehículo ${vehiculoId}:`, data);
      
      if (Array.isArray(data) && data.length > 0) {
        setMantenimientosPorVehiculo(prev => ({
          ...prev,
          [vehiculoId]: data
        }));
      } else {
        console.log(`ℹ️ Sin mantenimientos para vehículo ${vehiculoId}`);
      }
    } catch (err) {
      console.error("❌ Error cargando mantenimientos:", err);
    }
  };

  useEffect(() => {
    cargarVehiculos();
  }, []);

  // Si se viene desde una notificación, desplegar el vehículo correspondiente
  useEffect(() => {
    if (location.state?.vehiculoId && vehiculos.length > 0) {
      const vehiculo = vehiculos.find(v => v._id === location.state.vehiculoId);
      if (vehiculo) {
        setActiveVehicle(vehiculo._id);
        // Desplazarse suavemente hacia el vehículo
        setTimeout(() => {
          const element = document.querySelector(`[data-vehiculo-id="${vehiculo._id}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  }, [location.state?.vehiculoId, vehiculos]);

  const handleAgregarVehiculo = async (e) => {
    e.preventDefault();
    
    // Validar que marca y modelo no estén vacíos
    if (!nuevoVehiculo.marca.trim()) {
      toast.warning("La marca es requerida");
      return;
    }
    if (!nuevoVehiculo.modelo.trim()) {
      toast.warning("El modelo es requerido");
      return;
    }
    if (!nuevoVehiculo.placa.trim()) {
      toast.warning("La placa es requerida");
      return;
    }
    
    const formData = new FormData();
    // Limpiar espacios en blanco de strings
    Object.keys(nuevoVehiculo).forEach((k) => {
      const valor = nuevoVehiculo[k];
      formData.append(k, typeof valor === 'string' ? valor.trim() : valor);
    });
    if (imagenVehiculo) formData.append("imagen", imagenVehiculo);

    try {
      const res = await fetch(`${API_URL}/vehiculo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Vehículo agregado");
        setVehiculos((prev) => [...prev, data.vehiculo]);
        setNuevoVehiculo({ marca: "", modelo: "", placa: "", color: "", kilometraje: "", combustible: "Gasolina", tipoUso: "diario", tipoAceite: "sintético", usoEspecial: "normal", fechaCompraSoat: "", fechaCompraTeconomecanica: "" });
        setImagenVehiculo(null);
        setPreviewVehiculo(null);
      } else toast.error(data.error || "No se pudo agregar");
    } catch (err) {
      toast.error("Error de conexión");
    }
  };

  const handleEliminarVehiculo = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este vehículo?")) return;
    try {
      const res = await fetch(`${API_URL}/vehiculo/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setVehiculos((prev) => prev.filter((v) => v._id !== id));
      else toast.error("No se pudo eliminar");
    } catch (err) {
      toast.error("Error al conectar con el servidor");
    }
  };

  const openDocs = (v) => {
    setActiveVehicle(v);
    setFormDocs({ soat: null, tecnomecanica: null });
    setDocModalOpen(true);
  };

  const submitDocs = async () => {
    if (!activeVehicle) return;
    if (!formDocs.soat && !formDocs.tecnomecanica) {
      toast.warning("Selecciona al menos un documento");
      return;
    }
    const formData = new FormData();
    if (formDocs.soat) formData.append("soat", formDocs.soat);
    if (formDocs.tecnomecanica) formData.append("tecnomecanica", formDocs.tecnomecanica);

    try {
      const res = await fetch(`${API_URL}/vehiculo/${activeVehicle._id}/documentos`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
      const data = await res.json();
      if (res.ok) {
        toast.success("Documentos subidos");
        setDocModalOpen(false);
        cargarVehiculos();
      } else toast.error(data.error || "Error al subir documentos");
    } catch (err) {
      toast.error("Error al conectar");
    }
  };

  const openKm = (v) => {
    setActiveVehicle(v);
    setFormKm({ 
      nuevoKilometraje: "", 
      combustible: v.combustible || "", 
      tipoAceite: v.tipoAceite || "",
      color: v.color || "",
      usoEspecial: v.usoEspecial || ""
    });
    setKmModalOpen(true);
  };

  const openFechas = (v) => {
    setActiveVehicle(v);
    setFormFechas({
      fechaCompraSoat: v.fechaCompraSoat ? v.fechaCompraSoat.split('T')[0] : "",
      fechaCompraTeconomecanica: v.fechaCompraTeconomecanica ? v.fechaCompraTeconomecanica.split('T')[0] : ""
    });
    setFechasModalOpen(true);
  };

  const submitKm = async () => {
    if (!activeVehicle) return;
    
    // Verificar que al menos un campo esté siendo actualizado
    if (!formKm.nuevoKilometraje && !formKm.combustible && !formKm.tipoAceite && !formKm.color && !formKm.usoEspecial) {
      toast.warning("Actualiza al menos un campo");
      return;
    }
    
    // Si hay km, validar que sea mayor al actual
    if (formKm.nuevoKilometraje) {
      const nuevoKm = parseInt(formKm.nuevoKilometraje, 10);
      if (isNaN(nuevoKm) || nuevoKm < 0) {
        toast.warning("Kilometraje inválido");
        return;
      }
      if (nuevoKm <= (activeVehicle.kilometraje || 0)) {
        toast.warning("El kilometraje debe ser mayor al actual");
        return;
      }
    }
    
    try {
      // Preparar datos - solo incluir campos que tengan valor
      const datosActualizar = {};
      if (formKm.nuevoKilometraje) datosActualizar.nuevoKilometraje = parseInt(formKm.nuevoKilometraje, 10);
      if (formKm.combustible) datosActualizar.combustible = formKm.combustible;
      if (formKm.tipoAceite) datosActualizar.tipoAceite = formKm.tipoAceite;
      if (formKm.color) datosActualizar.color = formKm.color;
      if (formKm.usoEspecial) datosActualizar.usoEspecial = formKm.usoEspecial;

      const res = await fetch(`${API_URL}/vehiculo/${activeVehicle._id}/kilometraje`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(datosActualizar),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Vehículo actualizado correctamente");
        setKmModalOpen(false);
        cargarVehiculos();
      } else toast.error(data.error || "No se pudo actualizar");
    } catch (err) {
      toast.error("Error de conexión");
    }
  };

  const submitFechas = async () => {
    if (!activeVehicle) return;
    try {
      const res = await fetch(`${API_URL}/vehiculo/${activeVehicle._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          fechaCompraSoat: formFechas.fechaCompraSoat || null,
          fechaCompraTeconomecanica: formFechas.fechaCompraTeconomecanica || null
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Fechas de compra actualizadas");
        setFechasModalOpen(false);
        cargarVehiculos();
      } else toast.error(data.error || "No se pudo actualizar");
    } catch (err) {
      toast.error("Error de conexión");
    }
  };

 return (
  <div className="perfil-container">
    <ToastContainer position="top-center" autoClose={2500} />

    {/* ALERTAS DE VENCIMIENTO - DESHABILITADO, se muestra en el panel de notificaciones */}
    {/* <AlertasVencimiento 
      usuarioId={localStorage.getItem("userId")} 
      token={localStorage.getItem("token")}
    /> */}

    <section className="vehiculos-section">
      <div className="vehiculos-header">
        <h3 className="vehiculos-titulo">Mis Vehículos</h3>
      </div>

      <div className="agregar-vehiculo-container">
        <form onSubmit={handleAgregarVehiculo} className="agregar-vehiculo-form">
          <div className="form-inputs">
            <div className="input-group">
              <input
                placeholder="Marca"
                value={nuevoVehiculo.marca}
                onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, marca: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <input
                placeholder="Modelo"
                value={nuevoVehiculo.modelo}
                onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, modelo: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <input
                placeholder="Placa"
                value={nuevoVehiculo.placa}
                onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, placa: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-inputs">
            <div className="input-group">
              <input
                placeholder="Color"
                value={nuevoVehiculo.color}
                onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, color: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <span className="input-icon"></span>
              <input
                type="number"
                placeholder="Kilometraje"
                value={nuevoVehiculo.kilometraje}
                onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, kilometraje: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <select
                value={nuevoVehiculo.combustible}
                onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, combustible: e.target.value })}
                required
              >
                <option value="Gasolina">Gasolina</option>
                <option value="Diesel">Diesel</option>
                <option value="Gas">Gas</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Eléctrico">Eléctrico</option>
              </select>
            </div>
            <div className="input-group">
              <select
                value={nuevoVehiculo.tipoUso}
                onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, tipoUso: e.target.value })}
              >
                <option value="diario">Uso Diario</option>
                <option value="ocasional">Uso Ocasional</option>
              </select>
            </div>
            <div className="input-group">
              <span className="input-icon"></span>
              <select
                value={nuevoVehiculo.tipoAceite}
                onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, tipoAceite: e.target.value })}
              >
                <option value="mineral">Aceite Mineral</option>
                <option value="semisintético">Aceite Semisintético</option>
                <option value="sintético">Aceite Sintético</option>
              </select>
            </div>
            <div className="input-group">
              <span className="input-icon"></span>
              <select
                value={nuevoVehiculo.usoEspecial}
                onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, usoEspecial: e.target.value })}
              >
                <option value="normal">Uso Normal</option>
                <option value="ciudad_trancones">Ciudad con Trancones</option>
                <option value="carretera">Carretera</option>
              </select>
            </div>
          </div>

          <div className="form-inputs">
            <div className="input-group">
              <input
                type="date"
                placeholder="Fecha Compra SOAT"
                value={nuevoVehiculo.fechaCompraSoat}
                onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, fechaCompraSoat: e.target.value })}
                title="Fecha Compra SOAT"
              />
            </div>
            <div className="input-group">
              <input
                type="date"
                placeholder="Fecha Compra Técnico-Mecánica"
                value={nuevoVehiculo.fechaCompraTeconomecanica}
                onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, fechaCompraTeconomecanica: e.target.value })}
                title="Fecha Compra Técnico-Mecánica"
              />
            </div>
          </div>

          <div className="form-actions">
            <div className="cargar-imagen-section">
              <label className="btn-seleccionar-archivo">
                Imagen del vehículo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (!file.type.startsWith("image/")) return toast.error("Debe ser una imagen");
                    setImagenVehiculo(file);
                    setPreviewVehiculo(URL.createObjectURL(file));
                  }}
                />
              </label>
              {previewVehiculo && (
                <span className="archivo-seleccionado">Archivo seleccionado</span>
              )}
            </div>
            <button type="submit" className="btn-agregar-vehiculo">
              Agregar Vehículo
            </button>
          </div>
        </form>
      </div>

      {loadingVehiculos ? (
        <div className="vehiculos-loading">
          <div className="spinner"></div>
          <p>Cargando vehículos...</p>
        </div>
      ) : vehiculos.length === 0 ? (
        <div className="vehiculos-empty">
          <p>📭 No tienes vehículos registrados</p>
        </div>
      ) : (
        <div className="vehiculos-grid">
          {vehiculos.map((v) => (
            <div key={v._id} data-vehiculo-id={v._id} className={`vehiculo-card-new ${activeVehicle === v._id ? 'activo' : ''}`}>
              <div className="vehiculo-image-container">
                {buildImgUrl(v.imagen) ? (
                  <img className="vehiculo-img-new" src={buildImgUrl(v.imagen)} alt={`${v.marca} ${v.modelo}`} />
                ) : (
                  <div className="vehiculo-img-placeholder">V</div>
                )}
              </div>
              
              <div className="vehiculo-placa-badge">
                <span className="placa-numero">{v.placa}</span>
              </div>

              <div className="vehiculo-details">
                <p className="detail-item"><strong>Marca:</strong> {v.marca}</p>
                <p className="detail-item"><strong>Modelo:</strong> {v.modelo}</p>
                <p className="detail-item"><strong>Color:</strong> {v.color}</p>
                <p className="detail-item"><strong>Kilometraje:</strong> {Number(v.kilometraje).toLocaleString('es-CO')} km</p>
                <p className="detail-item"><strong>Combustible:</strong> {v.combustible}</p>
                <p className="detail-item"><strong>Uso:</strong> {v.tipoUso === 'diario' ? 'Diario' : 'Ocasional'}</p>
                {v.tipoAceite && <p className="detail-item"><strong>Aceite:</strong> {v.tipoAceite.charAt(0).toUpperCase() + v.tipoAceite.slice(1)}</p>}
                {v.usoEspecial && <p className="detail-item"><strong>Uso Especial:</strong> {v.usoEspecial === 'ciudad_trancones' ? 'Ciudad con Trancones' : 'Normal'}</p>}
              </div>

              <div className="vehiculo-actions-new">
                <button className="btn-action-documento" onClick={() => openDocs(v)}>
                  Cargar Documentos
                </button>
                <button className="btn-action-editar" onClick={() => openKm(v)}>
                  Editar Kilometraje
                </button>
                <button className="btn-action-fechas" onClick={() => openFechas(v)}>
                  Fechas de Compra
                </button>
                <button className="btn-action-mantenimientos" onClick={() => { setActiveVehicle(v); setMantenimientosModalOpen(true); }}>
                  Mantenimientos
                </button>
                <button className="btn-action-eliminar" onClick={() => handleEliminarVehiculo(v._id)}>
                  Eliminar Vehículo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>

    {/* MODALES */}
    <Modal open={docModalOpen} title="Subir Documentos" onClose={() => setDocModalOpen(false)}>
      <div className="modal-body">
        <label>SOAT</label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setFormDocs({ ...formDocs, soat: e.target.files[0] })}
        />
        <label>Tecnomecánica</label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setFormDocs({ ...formDocs, tecnomecanica: e.target.files[0] })}
        />
        <div className="modal-buttons">
          <button className="btn-guardar" onClick={submitDocs}>
            Subir
          </button>
          <button className="btn-cancelar" onClick={() => setDocModalOpen(false)}>
            Cancelar
          </button>
        </div>
      </div>
    </Modal>

    <Modal open={kmModalOpen} title="Actualizar Vehículo" onClose={() => setKmModalOpen(false)}>
      <div className="modal-body">
        <label>⛽ Kilometraje (Opcional)</label>
        <input
          type="number"
          value={formKm.nuevoKilometraje}
          onChange={(e) => setFormKm({ ...formKm, nuevoKilometraje: e.target.value })}
          placeholder="Nuevo kilometraje"
        />

        <label>Color (Opcional)</label>
        <input
          type="text"
          value={formKm.color}
          onChange={(e) => setFormKm({ ...formKm, color: e.target.value })}
          placeholder="Ej: Rojo, Negro, Plateado"
        />

        <label>⛽ Combustible (Opcional)</label>
        <select
          value={formKm.combustible}
          onChange={(e) => setFormKm({ ...formKm, combustible: e.target.value })}
        >
          <option value="">-- Sin cambios --</option>
          <option value="Gasolina">Gasolina</option>
          <option value="Diesel">Diesel</option>
          <option value="Gas">Gas</option>
          <option value="Híbrido">Híbrido</option>
          <option value="Eléctrico">Eléctrico</option>
        </select>

        <label>🛢️ Tipo de Aceite (Opcional)</label>
        <select
          value={formKm.tipoAceite}
          onChange={(e) => setFormKm({ ...formKm, tipoAceite: e.target.value })}
        >
          <option value="">-- Sin cambios --</option>
          <option value="mineral">Mineral</option>
          <option value="semisintético">Semisintético</option>
          <option value="sintético">Sintético</option>
        </select>

        <label>🚦 Uso Especial (Opcional)</label>
        <select
          value={formKm.usoEspecial}
          onChange={(e) => setFormKm({ ...formKm, usoEspecial: e.target.value })}
        >
          <option value="">-- Sin cambios --</option>
          <option value="normal">Normal</option>
          <option value="ciudad_trancones">Ciudad con Trancones</option>
          <option value="carretera">Carretera</option>
        </select>

        <div className="modal-buttons">
          <button className="btn-guardar" onClick={submitKm}>
            Actualizar
          </button>
          <button className="btn-cancelar" onClick={() => setKmModalOpen(false)}>
            Cancelar
          </button>
        </div>
      </div>
    </Modal>

    <Modal open={fechasModalOpen} title="Fechas de Compra de Documentos" onClose={() => setFechasModalOpen(false)}>
      <div className="modal-body">
        <label>Fecha de Compra SOAT</label>
        <input
          type="date"
          value={formFechas.fechaCompraSoat}
          onChange={(e) => setFormFechas({ ...formFechas, fechaCompraSoat: e.target.value })}
        />
        <label>Fecha de Compra Técnico-Mecánica</label>
        <input
          type="date"
          value={formFechas.fechaCompraTeconomecanica}
          onChange={(e) => setFormFechas({ ...formFechas, fechaCompraTeconomecanica: e.target.value })}
        />
        <div className="modal-buttons">
          <button className="btn-guardar" onClick={submitFechas}>
            Guardar
          </button>
          <button className="btn-cancelar" onClick={() => setFechasModalOpen(false)}>
            Cancelar
          </button>
        </div>
      </div>
    </Modal>

    <Modal open={mantenimientosModalOpen} title={`Mantenimientos - ${activeVehicle?.marca} ${activeVehicle?.modelo}`} onClose={() => setMantenimientosModalOpen(false)}>
      <div className="modal-body mantenimientos-modal">
        {/* SECCIÓN DE SERVICIOS COMPLETADOS */}
        {serviciosPorVehiculo[activeVehicle?._id] && serviciosPorVehiculo[activeVehicle?._id].length > 0 && (
          <div className="modal-section">
            <h4 className="section-title">Servicios Completados</h4>
            <div className="servicios-lista">
              {serviciosPorVehiculo[activeVehicle?._id].map((servicio) => (
                <div key={servicio._id} className="servicio-item-modal">
                  <div className="servicio-detalles-modal">
                    <p className="servicio-nombre"><strong>{servicio.nombreServicio || 'Servicio'}</strong></p>
                    <p className="servicio-mecanico">Por: {servicio.mecanicoId?.nombre || 'Mecánico'}</p>
                    <p className="servicio-fecha">{servicio.solicitudId?.fecha ? new Date(servicio.solicitudId.fecha).toLocaleDateString('es-CO') : 'Fecha N/A'}</p>
                  </div>
                  {servicio.informe && (
                    <div className="servicio-botones-modal">
                      {(() => {
                        // Limpiar la ruta si tiene doble uploads/
                        let pdfPath = servicio.informe;
                        if (pdfPath.startsWith('uploads/uploads/')) {
                          pdfPath = pdfPath.replace('uploads/', '');
                        }
                        const pdfUrl = `http://localhost:3000/${pdfPath}`;
                        return (
                          <>
                            <a
                              href={pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-ver-pdf-mant"
                              title="Ver informe"
                            >
                              👁️ Ver PDF
                            </a>
                            <a
                              href={pdfUrl}
                              download
                              className="btn-descargar-pdf-mant"
                              title="Descargar informe"
                            >
                              📥 Descargar
                            </a>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECCIÓN DE MANTENIMIENTOS */}
        {mantenimientosPorVehiculo[activeVehicle?._id] && mantenimientosPorVehiculo[activeVehicle?._id].length > 0 ? (
          <div className="modal-section">
            <h4 className="section-title">Historial de Mantenimiento</h4>
            <div className="mantenimientos-lista">
            {mantenimientosPorVehiculo[activeVehicle?._id].map((mant) => (
              <div key={mant._id} className="mantenimiento-item">
                <div className="mant-detalles">
                  <p className="mant-tipo"><strong>Tipo:</strong> {mant.tipoMantenimiento || 'N/A'}</p>
                  <p className="mant-km"><strong>Km:</strong> {mant.kilometrajeRealizado || 'N/A'}</p>
                  <p className="mant-fecha"><strong>Fecha:</strong> {mant.fecha ? new Date(mant.fecha).toLocaleDateString('es-CO') : 'N/A'}</p>
                  <p className="mant-desc"><strong>Descripción:</strong> {mant.descripcion || 'Sin descripción'}</p>
                </div>
                {mant.informe && (
                  <div className="mant-botones">
                    {(() => {
                      // Limpiar la ruta si tiene doble uploads/
                      let pdfPath = mant.informe;
                      if (pdfPath.startsWith('uploads/uploads/')) {
                        pdfPath = pdfPath.replace('uploads/', '');
                      }
                      const pdfUrl = `http://localhost:3000/${pdfPath}`;
                      return (
                        <>
                          <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-ver-pdf-mant"
                            title="Ver informe"
                          >
                            👁️ Ver PDF
                          </a>
                          <a
                            href={pdfUrl}
                            download
                            className="btn-descargar-pdf-mant"
                            title="Descargar informe"
                          >
                            📥 Descargar
                          </a>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            ))}
            </div>
          </div>
        ) : (
          !serviciosPorVehiculo[activeVehicle?._id] || serviciosPorVehiculo[activeVehicle?._id].length === 0 ? (
            <p className="sin-mantenimientos">No hay servicios ni mantenimientos registrados para este vehículo</p>
          ) : null
        )}
        <div className="modal-buttons">
          <button className="btn-cancelar" onClick={() => setMantenimientosModalOpen(false)}>
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  </div>
);
}