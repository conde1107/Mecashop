import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/miscitas.css";

const API_BASE = "http://localhost:3000/api";

const MisCitas = () => {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [reprogramarModal, setReprogramarModal] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevaHora, setNuevaHora] = useState("");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const fetchCitas = async () => {
    try {
      setCargando(true);
      const res = await fetch(`${API_BASE}/solicitudes/cliente/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      const citasPendientes = Array.isArray(data)
        ? data.filter(c => c.estado === "pendiente" && c.nombreServicio)
        : [];
      setCitas(citasPendientes);
    } catch (error) {
      console.error("Error al obtener citas:", error);
      toast.error("Error al cargar las citas: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (userId && token) fetchCitas();
  }, [userId, token]);

  const cancelarCita = async (citaId) => {
    if (!window.confirm("¿Deseas cancelar esta cita?")) return;
    try {
      console.log('[cancelarCita] Cancelando cita con ID:', citaId);
      const res = await fetch(`${API_BASE}/solicitudes/${citaId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Cita cancelada");
        fetchCitas();
      } else {
        console.error("Error al cancelar:", data);
        toast.error(data.error || data.mensaje || "No se pudo cancelar la cita");
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      toast.error("Error al conectar con el servidor: " + err.message);
    }
  };

  const abrirReprogramar = (cita) => {
    setSelectedCita(cita);
    setNuevaFecha(cita.fecha || "");
    setNuevaHora(cita.hora || "");
    setReprogramarModal(true);
  };

  const reprogramarCita = async () => {
    if (!selectedCita) return;

    // Validar que la nueva fecha no sea anterior a la fecha original
    if (new Date(nuevaFecha) < new Date(selectedCita.fecha)) {
      toast.error("No se puede reprogramar a una fecha anterior a la original");
      return;
    }

    try {
      console.log('[reprogramarCita] Reprogramando cita con ID:', selectedCita._id);
      const res = await fetch(`${API_BASE}/solicitudes/${selectedCita._id}/reprogramar`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fecha: nuevaFecha, hora: nuevaHora }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Cita reprogramada");
        setReprogramarModal(false);
        setSelectedCita(null);
        fetchCitas();
      } else {
        console.error("Error al reprogramar:", data);
        toast.error(data.error || data.mensaje || "No se pudo reprogramar la cita");
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      toast.error("Error de conexión: " + err.message);
    }
  };

  if (cargando) {
    return (
      <div className="mis-citas-container">
        <h2>Mis Citas Pendientes</h2>
        <p>Cargando citas...</p>
      </div>
    );
  }

  return (
    <div className="mis-citas-container">
      <ToastContainer position="top-center" autoClose={2500} />
      <h2>Mis Citas Pendientes</h2>

      {citas.length === 0 ? (
        <p className="no-citas">
          No tienes citas pendientes. El mecánico aún no ha marcado ningún servicio como pendiente.
        </p>
      ) : (
        <div className="citas-grid">
          {citas.map((cita) => (
            <div key={cita._id} className="cita-card">
              <div className="cita-header">
                <h3>Cita con {cita.mecanicoId?.nombre || "Mecánico"}</h3>
                <span className={`cita-estado ${cita.estado}`}>
                  {cita.estado === "pendiente" && " Pendiente"}
                  {cita.estado === "aceptada" && " Aceptada"}
                  {cita.estado === "cancelada" && " Cancelada"}
                </span>
              </div>

              <div className="cita-info">
                {cita.nombreServicio && <p><strong>Servicio:</strong> {cita.nombreServicio}</p>}
                {cita.descripcion && <p><strong>Descripción:</strong> {cita.descripcion}</p>}
                {cita.precio && cita.precio > 0 && <p><strong>Precio:</strong> ${cita.precio}</p>}
                {cita.fecha && <p><strong>Fecha:</strong> {cita.fecha}</p>}
                {cita.hora && <p><strong>Hora:</strong> {cita.hora}</p>}
                <p><strong>Mecánico:</strong> {cita.mecanicoId?.nombre || "No especificado"}</p>
                {cita.mecanicoId?.telefono && <p><strong>Teléfono:</strong> {cita.mecanicoId.telefono}</p>}
                {cita.mecanicoId?.zona && <p><strong>Zona:</strong> {cita.mecanicoId.zona}</p>}
              </div>

              <div className="cita-actions">
                {(cita.estado === "pendiente" || cita.estado === "aceptada") && (
                  <>
                    <button className="btn-cancelar" onClick={() => cancelarCita(cita._id)}>Cancelar</button>
                    <button className="btn-actualizar" onClick={() => abrirReprogramar(cita)}>Reprogramar</button>
                  </>
                )}
                {cita.estado === "cancelada" && (
                  <p style={{ margin: 0, color: "#991b1b", textAlign: "center", width: "100%" }}>
                    Esta cita ha sido cancelada
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Reprogramar */}
      {reprogramarModal && selectedCita && (
        <div className="modal-overlay" onClick={() => setReprogramarModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h4>Reprogramar cita con {selectedCita.mecanicoId?.nombre}</h4>
            <label>Fecha:</label>
            <input
              type="date"
              value={nuevaFecha}
              onChange={(e) => setNuevaFecha(e.target.value)}
              min={selectedCita.fecha ? selectedCita.fecha.split("T")[0] : new Date().toISOString().split("T")[0]} 
            />
            <label>Hora:</label>
            <input type="time" value={nuevaHora} onChange={(e) => setNuevaHora(e.target.value)} />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn-actualizar" onClick={reprogramarCita}>Guardar Cambios</button>
              <button className="btn-cancelar" onClick={() => setReprogramarModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisCitas;
