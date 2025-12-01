//pages/citamecanico.jsx
import React, { useState, useEffect } from "react";
import "../styles/citasmecanico.css";

const CitasMecanico = () => {
  const [citas, setCitas] = useState([]);
  const token = localStorage.getItem("token");
  const mecanicoId = localStorage.getItem("userId");

  // ✅ Obtener citas del mecánico
  const fetchCitas = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/solicitudes/mecanico/${mecanicoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      // ✅ Solo mostrar pendientes
      setCitas(data.filter((cita) => cita.estado === "pendiente"));
    } catch (error) {
      console.error("Error al obtener citas:", error);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, []);

  // ✅ Aceptar cita
  const aceptarCita = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/solicitudes/${id}/aceptar`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      alert(data.mensaje);
      fetchCitas();
    } catch (error) {
      console.error("Error al aceptar cita:", error);
      alert("❌ Error al aceptar cita");
    }
  };

  // ✅ Rechazar cita
  const rechazarCita = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/solicitudes/${id}/rechazar`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      alert(data.mensaje);
      fetchCitas();
    } catch (error) {
      console.error("Error al rechazar cita:", error);
      alert("❌ Error al rechazar cita");
    }
  };

  return (
    <div className="citas-mecanico-container">
      <h2>Mis Citas Pendientes</h2>

      {citas.length === 0 ? (
        <p>No tienes citas pendientes.</p>
      ) : (
        <table className="tabla-citas">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Servicios</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {citas.map((cita) => (
              <tr key={cita._id}>
                <td>{cita.clienteId?.nombre}</td>

                {/* ✅ Mostrar todos los servicios */}
                <td>
                  {Array.isArray(cita.servicios) && cita.servicios.length > 0 ? (
                    <ul className="lista-servicios">
                      {cita.servicios.map((servicio, index) => (
                        <li key={index}>
                          {servicio.nombreServicio}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "Sin servicios"
                  )}
                </td>

                <td>{cita.fecha}</td>
                <td>{cita.hora}</td>

                <td>
                  <button
                    className="btn-aceptar"
                    onClick={() => aceptarCita(cita._id)}
                  >
                    Aceptar
                  </button>

                  <button
                    className="btn-rechazar"
                    onClick={() => rechazarCita(cita._id)}
                  >
                    Rechazar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CitasMecanico;
