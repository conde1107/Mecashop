//pages/servicio.jsx
import React, { useState, useEffect } from "react";
import "../styles/CitasMecanico.css";

const ServiciosMecanico = () => {
  const [grupos, setGrupos] = useState([]);
  const [subiendo, setSubiendo] = useState(null);
  const token = localStorage.getItem("token");
  const mecanicoId = localStorage.getItem("userId");

  // ✅ Obtener servicios del mecánico y agrupar por solicitud
  const fetchServicios = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/servicios/mecanico/${mecanicoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      // Agrupar por solicitudId
      const agrupados = data.reduce((acc, serv) => {
        const key = serv.solicitudId?._id || serv.solicitudId;
        if (!acc[key]) {
          acc[key] = {
            solicitud: serv.solicitudId,
            cliente: serv.clienteId,
            servicios: [],
          };
        }
        acc[key].servicios.push(serv);
        return acc;
      }, {});

      setGrupos(Object.values(agrupados));
    } catch (error) {
      console.error("Error al obtener servicios:", error);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  // ✅ Subir informe PDF individual
  const subirInforme = async (id, archivo) => {
    if (!archivo) return alert("Selecciona un PDF primero");

    const formData = new FormData();
    formData.append("informe", archivo);

    try {
      setSubiendo(id);
      const res = await fetch(`http://localhost:3000/api/servicios/${id}/subirInforme`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        alert("✅ PDF subido correctamente");
        fetchServicios();
      } else {
        alert(data.mensaje || "Error al subir PDF");
      }
    } catch (error) {
      console.error("Error al subir archivo:", error);
      alert("Error con el servidor");
    } finally {
      setSubiendo(null);
    }
  };

  // ✅ Marcar servicio como completado
  const completarServicio = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/servicios/${id}/completar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      alert(data.mensaje);
      fetchServicios();
    } catch (error) {
      console.error("Error al completar servicio:", error);
    }
  };

  // ✅ Completar todos los servicios de una solicitud
  const completarTodos = async (solicitud) => {
    for (const serv of solicitud.servicios) {
      await completarServicio(serv._id);
    }
  };

  return (
    <div className="citas-mecanico-container">
      <h2>Servicios Asignados</h2>
      {grupos.length === 0 ? (
        <p className="mensaje-vacio">No tienes servicios actualmente.</p>
      ) : (
        grupos.map((grupo) => (
          <div key={grupo.solicitud?._id} className="grupo-solicitud">
            <div className="cabecera-solicitud">
              <h3>Cliente: {grupo.cliente?.nombre}</h3>
              <p>
                Solicitud: {grupo.solicitud?._id || "Sin ID"} | Fecha:{" "}
                {grupo.solicitud?.fecha || "N/A"} | Hora:{" "}
                {grupo.solicitud?.hora || "N/A"}
              </p>
              <button
                className="btn-completar-todos"
                onClick={() => completarTodos(grupo)}
              >
                Completar todos
              </button>
            </div>

            <table className="tabla-servicios">
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Estado</th>
                  <th>Informe</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {grupo.servicios.map((serv) => (
                  <tr key={serv._id}>
                    <td>{serv.nombreServicio}</td>
                    <td>
                      <span
                        className={
                          serv.estado === "pendiente"
                            ? "estado-pendiente"
                            : "estado-completado"
                        }
                      >
                        {serv.estado}
                      </span>
                    </td>
                    <td>
                      {serv.informe ? (
                        <>
                          {(() => {
                            // Limpiar la ruta si tiene doble uploads/
                            let pdfPath = serv.informe;
                            if (pdfPath.startsWith('uploads/uploads/')) {
                              pdfPath = pdfPath.replace('uploads/', '');
                            }
                            const pdfUrl = `http://localhost:3000/${pdfPath}`;
                            return (
                              <a
                                href={pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Ver PDF
                              </a>
                            );
                          })()}
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) =>
                              subirInforme(serv._id, e.target.files[0])
                            }
                          />
                        </>
                      ) : (
                        <>
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) =>
                              subirInforme(serv._id, e.target.files[0])
                            }
                          />
                          {subiendo === serv._id ? (
                            <p className="subiendo-texto">Subiendo...</p>
                          ) : (
                            <p className="adjunta-texto">Adjunta un PDF</p>
                          )}
                        </>
                      )}
                    </td>
                    <td>
                      {serv.estado === "pendiente" ? (
                        <button
                          className="btn-completar"
                          onClick={() => completarServicio(serv._id)}
                        >
                          Completar
                        </button>
                      ) : (
                        <span className="completado-texto">✔</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default ServiciosMecanico;
