//pages/calificarservicio.jsx
import React, { useState, useEffect } from "react";
import "../styles/calificarservicio.css";

const CalificarServicio = () => {
  const [serviciosPendientes, setServiciosPendientes] = useState([]);
  const [serviciosHistorial, setServiciosHistorial] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState("");
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState("");

  const token = localStorage.getItem("token");
  const clienteId = localStorage.getItem("userId");

  useEffect(() => {
    const cargarServicios = async () => {
      try {
        const resPendientes = await fetch(
          `http://localhost:3000/api/servicios/pendientes/${clienteId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const dataPendientes = await resPendientes.json();
        // Ordenar por fecha más reciente primero
        const pendientesOrdenados = dataPendientes.sort((a, b) => 
          new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
        );
        setServiciosPendientes(pendientesOrdenados);

        const resHistorial = await fetch(
          `http://localhost:3000/api/servicios/historial/${clienteId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const dataHistorial = await resHistorial.json();
        // Ordenar por fecha más reciente primero
        const historialOrdenado = dataHistorial.sort((a, b) => 
          new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
        );
        setServiciosHistorial(historialOrdenado);
      } catch (error) {
        console.error("Error al cargar servicios:", error);
      }
    };

    cargarServicios();
  }, [token, clienteId]);

  const enviarCalificacion = async (e) => {
    e.preventDefault();
    if (!servicioSeleccionado) return alert("Selecciona un servicio");
    if (calificacion === 0) return alert("Selecciona una calificación");

    try {
      const res = await fetch(
        `http://localhost:3000/api/servicios/${servicioSeleccionado}/calificar`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ calificacion, comentario }),
        }
      );
      const data = await res.json();
      alert(" Servicio calificado correctamente");

      setCalificacion(0);
      setComentario("");
      setServicioSeleccionado("");

      setServiciosPendientes(serviciosPendientes.filter((s) => s._id !== servicioSeleccionado));
      setServiciosHistorial([...serviciosHistorial, data.servicio]);
    } catch (error) {
      console.error("Error al calificar servicio:", error);
      alert("No se pudo enviar la calificación.");
    }
  };

  return (
    <div className="calificar-container">
      <h1 className="titulo-principal">Calificación de Servicios</h1>

      {/* SECCIÓN PENDIENTES */}
      <section className="seccion">
        <h2>Servicios Pendientes por Calificar</h2>

        {serviciosPendientes.length === 0 ? (
          <p className="no-servicios">No tienes servicios pendientes por calificar.</p>
        ) : (
          <>
            <div className="selector-servicio">
              <label>Selecciona un servicio:</label>
              <select
                value={servicioSeleccionado}
                onChange={(e) => setServicioSeleccionado(e.target.value)}
              >
                <option value="">-- Seleccionar --</option>
                {serviciosPendientes.map((s) => (
                  <option key={s._id} value={s._id}>
                    {`${s.nombreServicio} con ${s.mecanicoId?.nombre || "Mecánico"} — ${new Date(
                      s.fechaCreacion
                    ).toLocaleDateString()}`}
                  </option>
                ))}
              </select>
            </div>

            {/* PDF */}
            {servicioSeleccionado &&
              serviciosPendientes
                .filter((s) => s._id === servicioSeleccionado)
                .map((s) => (
                  s.informe ? (
                    <div key={s._id} className="pdf-container">
                      <p>Informe PDF del mecánico:</p>
                      <a
                        href={`http://localhost:3000/${s.informe}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pdf-link"
                        download
                      >
                        📥 Descargar PDF
                      </a>
                    </div>
                  ) : (
                    <p key={s._id} className="sin-pdf">
                       El mecánico aún no ha subido el informe PDF.
                    </p>
                  )
                ))}

            {/* FORMULARIO */}
            <form className="calificar-contenido" onSubmit={enviarCalificacion}>
              <label>Calificación:</label>
              <div className="estrellas">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={n <= calificacion ? "estrella activa" : "estrella"}
                    onClick={() => setCalificacion(n)}
                  >
                    ★
                  </span>
                ))}
              </div>

              <label>Comentario:</label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Escribe tu opinión..."
              />

              <button type="submit" className="btn-enviar">
                Enviar calificación
              </button>
            </form>
          </>
        )}
      </section>

      {/* SECCIÓN HISTORIAL */}
      <section className="seccion">
        <h2>Historial de Servicios Calificados</h2>
        <table className="tabla-historial">
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Fecha</th>
              <th>Calificación</th>
              <th>Comentario</th>
              <th>Informe PDF</th>
            </tr>
          </thead>
          <tbody>
            {serviciosHistorial.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-servicios">
                  No tienes servicios calificados aún.
                </td>
              </tr>
            ) : (
              serviciosHistorial.map((s) => (
                <tr key={s._id}>
                  <td>{s.nombreServicio}</td>
                  <td>{new Date(s.fechaCreacion).toLocaleDateString()}</td>
                  <td>{s.calificacion} ★</td>
                  <td>{s.comentario}</td>
                  <td>
                    {s.informe ? (
                      <a
                        href={`http://localhost:3000/${s.informe}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pdf-link"
                      >
                        Descargar PDF
                      </a>
                    ) : (
                      "No disponible"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default CalificarServicio;
