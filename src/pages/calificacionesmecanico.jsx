//pages/calificacionmecanico.jsx
import React, { useEffect, useState } from "react";
import "../styles/citasmecanico.css";

const CalificacionesMecanico = () => {
  const [calificaciones, setCalificaciones] = useState([]);
  const token = localStorage.getItem("token");
  const mecanicoId = localStorage.getItem("userId");

  const fetchCalificaciones = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/servicios/mecanico/${mecanicoId}/calificaciones`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await res.json();
      setCalificaciones(data);
    } catch (error) {
      console.error("Error al obtener calificaciones:", error);
    }
  };

  useEffect(() => {
    fetchCalificaciones();
  }, []);

  return (
    <div className="citas-mecanico-container">
      <h2>Calificaciones de tus servicios</h2>

      {calificaciones.length === 0 ? (
        <p>No tienes calificaciones aún.</p>
      ) : (
        <table className="tabla-servicios">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Servicio</th>
              <th>Calificación</th>
              <th>Comentario</th>
              <th>Fecha</th>
            </tr>
          </thead>

          <tbody>
            {calificaciones.map((serv) => (
              <tr key={serv._id}>
                <td>{serv.clienteId?.nombre}</td>
                <td>{serv.nombreServicio}</td>
                <td>{"★".repeat(serv.calificacion)}</td>
                <td>{serv.comentario || "Sin comentario"}</td>
                <td>{new Date(serv.fechaCreacion).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CalificacionesMecanico;
