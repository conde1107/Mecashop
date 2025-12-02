// src/pages/SolicitarCita.jsx
import React, { useState, useEffect } from "react";
import "../styles/solicitarcita.css";

const API_BASE = "http://localhost:3000/api";

const SolicitarCita = () => {
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [mecanico, setMecanico] = useState("");
  const [mecanicos, setMecanicos] = useState([]);
  const [serviciosMecanico, setServiciosMecanico] = useState([]);
  const [direccion, setDireccion] = useState("");
  const [esDomicilio, setEsDomicilio] = useState(false);
  const [ubicacion, setUbicacion] = useState({ lat: null, lng: null });
  const [localizando, setLocalizando] = useState(false);
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState("");
  const [servicioCompletado, setServicioCompletado] = useState(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Obtener lista de mecánicos y vehículos del usuario
  useEffect(() => {
    const fetchMecanicos = async () => {
      try {
        const res = await fetch(`${API_BASE}/mecanicos`);
        const data = await res.json();
        setMecanicos(data);
      } catch (err) {
        console.error("Error cargando mecánicos:", err);
      }
    };
    fetchMecanicos();

    // Cargar vehículos del usuario
    const fetchVehiculos = async () => {
      try {
        const res = await fetch(`${API_BASE}/vehiculos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setVehiculos(data);
      } catch (err) {
        console.error("Error cargando vehículos:", err);
      }
    };
    if (token) fetchVehiculos();
  }, [token]);

  // Obtener servicios del mecánico seleccionado
  useEffect(() => {
    if (!mecanico) {
      setServiciosMecanico([]);
      setServiciosSeleccionados([]);
      return;
    }

    const fetchServicios = async () => {
      try {
        const res = await fetch(`${API_BASE}/mecanicos/${mecanico}/ofertas`);
        const data = await res.json();
        setServiciosMecanico(data);
        setServiciosSeleccionados([]); // resetear selección al cambiar de mecánico
      } catch (err) {
        console.error("Error cargando servicios del mecánico:", err);
        setServiciosMecanico([]);
      }
    };

    fetchServicios();
  }, [mecanico]);

  // Cargar servicio completado cuando se selecciona un vehículo
  useEffect(() => {
    if (!vehiculoSeleccionado) {
      setServicioCompletado(null);
      return;
    }

    const fetchServicioCompletado = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/servicios/vehiculo/${vehiculoSeleccionado}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const servicios = await res.json();
        // Obtener el último servicio completado con informe
        const ultimoServicio = servicios.find(s => s.informe);
        setServicioCompletado(ultimoServicio || null);
      } catch (err) {
        console.error("Error cargando servicio completado:", err);
        setServicioCompletado(null);
      }
    };

    fetchServicioCompletado();
  }, [vehiculoSeleccionado, token]);

  const hoy = new Date().toISOString().split("T")[0];

  const manejarUbicacion = () => {
    if (!navigator.geolocation) {
      alert(" Tu navegador no soporta geolocalización.");
      return;
    }

    setLocalizando(true);
    console.log(" Solicitando ubicación...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nuevaUbicacion = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUbicacion(nuevaUbicacion);
        setLocalizando(false);
        console.log(" Ubicación detectada:", nuevaUbicacion);
        alert(` Ubicación detectada correctamente\nLat: ${nuevaUbicacion.lat.toFixed(4)}\nLng: ${nuevaUbicacion.lng.toFixed(4)}`);
      },
      (err) => {
        setLocalizando(false);
        console.error(" Error de geolocalización:", err);
        
        let mensaje = "Error obteniendo ubicación";
        switch(err.code) {
          case err.PERMISSION_DENIED:
            mensaje = " Permiso denegado.\n\nPasos para habilitar:\n1. Haz clic en el candado 🔒 en la barra de direcciones\n2. Permite el acceso a tu ubicación\n3. Recarga la página e intenta de nuevo";
            break;
          case err.POSITION_UNAVAILABLE:
            mensaje = " Ubicación no disponible.\n\nVerifica que:\n1. El GPS del dispositivo esté habilitado\n2. Estés en una zona con cobertura\n3. Intenta de nuevo en unos momentos";
            break;
          case err.TIMEOUT:
            mensaje = " La solicitud tardó demasiado.\nIntenta de nuevo en unos segundos";
            break;
          default:
            mensaje = ` Error: ${err.message}`;
        }
        alert(mensaje);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const toggleServicio = (id) => {
    setServiciosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fecha || !hora || serviciosSeleccionados.length === 0 || !mecanico) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    const fechaSeleccionada = new Date(fecha);
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < fechaActual) {
      alert("❌ No puedes seleccionar una fecha anterior a hoy.");
      return;
    }

    // Servicios seleccionados con sus detalles
    const serviciosDetalles = serviciosMecanico.filter((s) =>
      serviciosSeleccionados.includes(s._id)
    );

    const precioTotal = serviciosDetalles.reduce((acc, s) => acc + (s.precioEstimado ?? 0), 0);

    const nuevaCita = {
      clienteId: userId,
      mecanicoId: mecanico,
      vehiculoId: vehiculoSeleccionado,
      servicios: serviciosDetalles,
      precioTotal,
      fecha,
      hora,
      esDomicilio,
      direccion: esDomicilio ? direccion : "",
      ubicacion: esDomicilio ? ubicacion : { lat: null, lng: null },
    };

    try {
      const res = await fetch(`${API_BASE}/solicitudes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevaCita),
      });

      if (!res.ok) throw new Error("Error al registrar la cita");

      alert(` Cita solicitada con éxito.\nTotal a pagar: $${precioTotal.toLocaleString()}`);

      setFecha("");
      setHora("");
      setServiciosSeleccionados([]);
      setMecanico("");
      setDireccion("");
      setEsDomicilio(false);
    } catch (error) {
      alert(" No se pudo solicitar la cita. Intenta más tarde.");
      console.error("Error al solicitar cita:", error);
    }
  };

  return (
    <div className="cita-container">
      <h2>Solicitar Cita</h2>

      <form className="cita-form" onSubmit={handleSubmit}>
        <label>Fecha:</label>
        <input type="date" value={fecha} min={hoy} onChange={(e) => setFecha(e.target.value)} />

        <label>Hora:</label>
        <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />

        <label>Selecciona un vehículo (opcional):</label>
        <select 
          value={vehiculoSeleccionado} 
          onChange={(e) => setVehiculoSeleccionado(e.target.value)}
        >
          <option value="">-- No seleccionar vehículo --</option>
          {vehiculos.map((v) => (
            <option key={v._id} value={v._id}>
              {v.marca} {v.modelo} ({v.placa}) - {v.km} km
            </option>
          ))}
        </select>

        {servicioCompletado && (
          <div className="servicio-completado-box">
            <h4> Último servicio completado</h4>
            <p><strong>Mecánico:</strong> {servicioCompletado.mecanico?.nombre || "N/A"}</p>
            <p><strong>Fecha:</strong> {new Date(servicioCompletado.fechaCompletado).toLocaleDateString()}</p>
            <p><strong>Servicio:</strong> {servicioCompletado.nombre}</p>
            {servicioCompletado.informe && (
              <a 
                href={`http://localhost:3000/${servicioCompletado.informe}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-descargar-informe"
              >
                 Descargar Informe
              </a>
            )}
          </div>
        )}

        <label>Mecánico disponible:</label>
        <select value={mecanico} onChange={(e) => setMecanico(e.target.value)}>
          <option value="">Seleccionar mecánico</option>
          {mecanicos.map((m) => (
            <option key={m._id} value={m._id}>
              {m.nombre} - {m.especialidad}
            </option>
          ))}
        </select>

        {serviciosMecanico.length > 0 && (
          <>
            <label>Servicios ofrecidos por el mecánico:</label>
            <div className="checkbox-servicios">
              {serviciosMecanico.map((s) => (
                <label key={s._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={serviciosSeleccionados.includes(s._id)}
                    onChange={() => toggleServicio(s._id)}
                  />
                  {s.nombre} <span className="precio">(${(s.precioEstimado ?? 0).toLocaleString()})</span>
                </label>
              ))}
            </div>
          </>
        )}

        <div className="cita-domicilio">
          <label>
            <input
              type="checkbox"
              checked={esDomicilio}
              onChange={(e) => setEsDomicilio(e.target.checked)}
            />
            Solicitar servicio a domicilio
          </label>
        </div>

        {esDomicilio && (
          <>
            <label>Dirección exacta:</label>
            <input
              type="text"
              placeholder="Ej: Calle 45 #12-34"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
            <button 
              type="button" 
              className="btn-ubicacion" 
              onClick={manejarUbicacion}
              disabled={localizando}
            >
              {localizando ? " Detectando ubicación..." : "Detectar mi ubicación 📍"}
            </button>
            {ubicacion.lat && ubicacion.lng && (
              <div style={{ color: 'green', fontSize: '12px', marginTop: '5px' }}>
                 Ubicación detectada: {ubicacion.lat.toFixed(4)}, {ubicacion.lng.toFixed(4)}
              </div>
            )}
          </>
        )}

        <button type="submit" className="btn-cita">
          Solicitar Cita
        </button>
      </form>
    </div>
  );
};

export default SolicitarCita;
