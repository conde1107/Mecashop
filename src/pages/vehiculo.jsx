//pages/Vehiculo.jsx
import React, { useState, useEffect } from 'react';
import './Vehiculo.css';
import { useParams, useNavigate } from 'react-router-dom';

const Vehiculo = ({ obtenerVehiculoPorId, actualizarVehiculo }) => {
  const { id } = useParams(); // ID del vehículo desde la URL
  const navigate = useNavigate();

  const [vehiculo, setVehiculo] = useState(null);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    const v = obtenerVehiculoPorId(id); // Función que deberías tener en tu lógica de datos
    setVehiculo(v);
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehiculo((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardar = (e) => {
    e.preventDefault();
    actualizarVehiculo(vehiculo);
    setEditando(false);
    alert("Vehículo actualizado con éxito");
  };

  if (!vehiculo) return <p className="loading">Cargando vehículo...</p>;

  return (
    <div className="vehiculo-container">
      <h2>Gestión de Vehículo</h2>

      {!editando ? (
        <div className="vehiculo-info">
          <p><strong>Marca:</strong> {vehiculo.marca}</p>
          <p><strong>Modelo:</strong> {vehiculo.modelo}</p>
          <p><strong>Placa:</strong> {vehiculo.placa}</p>
          <p><strong>Color:</strong> {vehiculo.color}</p>
          <p><strong>Tipo de Combustible:</strong> {vehiculo.tipo_combustible}</p>
          <p><strong>Uso:</strong> {vehiculo.uso}</p>
          <p><strong>Kilometraje:</strong> {vehiculo.kilometraje_actual} km</p>

          <div className="vehiculo-botones">
            <button onClick={() => setEditando(true)}>Editar</button>
            <button onClick={() => navigate('/perfil')}>Volver</button>
          </div>
        </div>
      ) : (
        <form className="vehiculo-form" onSubmit={handleGuardar}>
          <label>
            Marca:
            <input name="marca" value={vehiculo.marca} onChange={handleChange} />
          </label>

          <label>
            Modelo:
            <input name="modelo" value={vehiculo.modelo} onChange={handleChange} />
          </label>

          <label>
            Placa:
            <input name="placa" value={vehiculo.placa} onChange={handleChange} />
          </label>

          <label>
            Color:
            <input name="color" value={vehiculo.color} onChange={handleChange} />
          </label>

          <label>
            Tipo de combustible:
            <select name="tipo_combustible" value={vehiculo.tipo_combustible} onChange={handleChange}>
              <option value="gasolina">Gasolina</option>
              <option value="diesel">Diésel</option>
              <option value="híbrido">Híbrido</option>
              <option value="eléctrico">Eléctrico</option>
            </select>
          </label>

          <label>
            Uso:
            <select name="uso" value={vehiculo.uso} onChange={handleChange}>
              <option value="personal">Personal</option>
              <option value="comercial">Comercial</option>
            </select>
          </label>

          <label>
            Kilometraje actual:
            <input
              name="kilometraje_actual"
              type="number"
              value={vehiculo.kilometraje_actual}
              onChange={handleChange}
              min="0"
            />
          </label>

          <div className="vehiculo-botones">
            <button type="submit">Guardar</button>
            <button type="button" onClick={() => setEditando(false)}>Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Vehiculo;
