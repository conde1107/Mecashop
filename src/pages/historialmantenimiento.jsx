//pages/historialmantenimiento.jsx
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./historialMantenimiento.css"; // <-- Importar CSS aquí

const HistorialMantenimiento = ({ idVehiculo, token }) => {
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const res = await fetch(`/api/vehiculo/${idVehiculo}/historial`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });
        const data = await res.json();
        setHistorial(data);
      } catch (error) {
        console.error("Error al cargar historial:", error);
      }
    };

    fetchHistorial();
  }, [idVehiculo, token]);

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Historial de Mantenimiento", 14, 22);
    doc.setFontSize(12);
    const tableColumn = ["Fecha", "Servicio", "Costo", "Observaciones"];
    const tableRows = [];

    historial.forEach(item => {
      const rowData = [
        item.fecha,
        item.servicio,
        `$${item.costo}`,
        item.observaciones || "-"
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save(`historial_vehiculo_${idVehiculo}.pdf`);
  };

  return (
    <div className="historial-container">
      <h2>Historial de Mantenimiento</h2>
      <table className="historial-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Servicio</th>
            <th>Costo</th>
            <th>Observaciones</th>
          </tr>
        </thead>
        <tbody>
          {historial.length === 0 ? (
            <tr>
              <td colSpan="4">No hay registros de mantenimiento</td>
            </tr>
          ) : (
            historial.map((item, index) => (
              <tr key={index}>
                <td>{item.fecha}</td>
                <td>{item.servicio}</td>
                <td>${item.costo}</td>
                <td>{item.observaciones || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <button className="historial-btn" onClick={exportarPDF}>
        Exportar a PDF
      </button>
    </div>
  );
};

export default HistorialMantenimiento;
