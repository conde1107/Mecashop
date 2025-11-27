//pages/mecanicotienda.jsx
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/mecanicotienda.css';

const API_BASE = 'http://localhost:3000/api';

const MecanicotiendaTienda = () => {
  const [mecanicos, setMecanicos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  
  const [formulario, setFormulario] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    especialidad: '',
    descripcion: '',
    horario: '',
    disponible: true,
    password: ''
  });

  const [archivoPDF, setArchivoPDF] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    cargarMecanicos();
  }, []);

  const cargarMecanicos = async () => {
    try {
      setCargando(true);
      const res = await fetch(`${API_BASE}/mecanicos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();

        const mecanicosData = Array.isArray(data) ? data : data.mecanicos || [];

        // 🔥 FIX: Asegurar que "disponible" siempre exista
        setMecanicos(
          mecanicosData.map(m => ({
            ...m,
            disponible: m.disponible ?? true
          }))
        );
      } else {
        setMecanicos([]);
      }
    } catch (error) {
      console.error('Error al cargar mecánicos:', error);
      setMecanicos([]);
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulario({
      ...formulario,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleArchivoPDF = (e) => {
    const archivo = e.target.files[0];
    if (archivo && archivo.type === 'application/pdf') {
      setArchivoPDF(archivo);
    } else {
      toast.error('Por favor selecciona un archivo PDF válido');
      setArchivoPDF(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formulario.nombre || !formulario.correo || !formulario.especialidad) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    if (!formulario.password || formulario.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!archivoPDF) {
      toast.error('Por favor adjunta un archivo PDF');
      return;
    }

    try {
      setGuardando(true);

      const formData = new FormData();
      formData.append('nombre', formulario.nombre);
      formData.append('correo', formulario.correo);
      formData.append('password', formulario.password);
      formData.append('rol', 'mecanico');
      formData.append('especialidad', formulario.especialidad);
      formData.append('pdf', archivoPDF);
      formData.append('telefono', formulario.telefono);
      formData.append('descripcion', formulario.descripcion);
      formData.append('horario', formulario.horario);

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        toast.success('Mecánico registrado exitosamente');

        setFormulario({
          nombre: '',
          correo: '',
          telefono: '',
          especialidad: '',
          descripcion: '',
          horario: '',
          disponible: true,
          password: ''
        });

        setArchivoPDF(null);
        setMostrarFormulario(false);

        setTimeout(() => cargarMecanicos(), 1000);

      } else {
        const error = await res.json();
        toast.error(error.error || error.message || 'Error al registrar mecánico');
      }
    } catch (error) {
      toast.error('Error al registrar mecánico');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (mecanicId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este mecánico?')) return;

    try {
      const res = await fetch(`${API_BASE}/mecanicos/${mecanicId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setMecanicos(mecanicos.filter(m => m._id !== mecanicId));
        toast.success('Mecánico eliminado');
      } else {
        toast.error('Error al eliminar mecánico');
      }
    } catch (error) {
      toast.error('Error al eliminar mecánico');
    }
  };

  const handleToggleDisponibilidad = async (mecanicId, disponibleActual) => {
    try {
      const res = await fetch(`${API_BASE}/mecanicos/${mecanicId}/disponible`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ disponible: !disponibleActual })
      });

      if (res.ok) {
        setMecanicos(
          mecanicos.map(m =>
            m._id === mecanicId ? { ...m, disponible: !disponibleActual } : m
          )
        );
        toast.success('Estado actualizado');
      } else {
        toast.error('Error al actualizar disponibilidad');
      }
    } catch (error) {
      toast.error('Error al actualizar disponibilidad');
    }
  };

  // 🔥 FILTROS FUNCIONANDO AL 100%
  const mecanicosFiltrados = mecanicos.filter(m => {
    if (filtro === 'disponibles') return m.disponible === true;
    if (filtro === 'ocupados') return m.disponible === false;
    return true;
  });

  return (
    <div className="mecanicos-tienda-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="mecanicos-header">
        <div className="header-content">
          <h1>👨‍🔧 Mis Mecánicos</h1>
          <p>Gestiona los mecánicos registrados en tu tienda</p>
        </div>
        <button 
          className="btn-agregar"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? '✕ Cancelar' : '➕ Registrar Mecánico'}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="formulario-mecanico">
          <h2>Registrar Nuevo Mecánico</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-columns">
              
              {/* Columna izquierda */}
              <div className="form-column">
                <div className="form-group">
                  <label>Nombre Completo *</label>
                  <input type="text" name="nombre" value={formulario.nombre} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="correo" value={formulario.correo} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Contraseña *</label>
                  <input type="password" name="password" value={formulario.password} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Teléfono</label>
                  <input type="tel" name="telefono" value={formulario.telefono} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>Especialidad *</label>
                  <select name="especialidad" value={formulario.especialidad} onChange={handleChange} required>
                    <option value="">Seleccione</option>
                    <option value="Mecánica General">Mecánica General</option>
                    <option value="Electricidad">Electricidad</option>
                    <option value="Electrónica">Electrónica</option>
                    <option value="Chasis">Chasis</option>
                    <option value="Motor">Motor</option>
                    <option value="Transmisión">Transmisión</option>
                    <option value="Suspensión">Suspensión</option>
                    <option value="Frenos">Frenos</option>
                  </select>
                </div>
              </div>

              {/* Columna derecha */}
              <div className="form-column">
                <div className="form-group">
                  <label>Horario</label>
                  <input type="text" name="horario" value={formulario.horario} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea name="descripcion" value={formulario.descripcion} onChange={handleChange} rows={3} />
                </div>

                <div className="form-group">
                  <label>Documento PDF *</label>
                  <div className="file-input-wrapper">
                    <input type="file" accept=".pdf" onChange={handleArchivoPDF} required />
                    <label className="file-label">
                      {archivoPDF ? `📄 ${archivoPDF.name}` : '📄 Selecciona un PDF'}
                    </label>
                  </div>
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input type="checkbox" name="disponible" checked={formulario.disponible} onChange={handleChange} />
                    Disponible
                  </label>
                </div>
              </div>

            </div>

            <button type="submit" className="btn-submit" disabled={guardando}>
              {guardando ? 'Registrando...' : '✅ Registrar'}
            </button>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className="filtros-section">
        <div className="filtro-buttons">
          <button className={`filtro-btn ${filtro === 'todos' ? 'activo' : ''}`} onClick={() => setFiltro('todos')}>
            Todos ({mecanicos.length})
          </button>

          <button className={`filtro-btn ${filtro === 'disponibles' ? 'activo' : ''}`} onClick={() => setFiltro('disponibles')}>
            Disponibles ({mecanicos.filter(m => m.disponible).length})
          </button>

          <button className={`filtro-btn ${filtro === 'ocupados' ? 'activo' : ''}`} onClick={() => setFiltro('ocupados')}>
            Ocupados ({mecanicos.filter(m => !m.disponible).length})
          </button>
        </div>
      </div>

      {/* Lista */}
      {cargando ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando mecánicos...</p>
        </div>
      ) : mecanicosFiltrados.length === 0 ? (
        <div className="empty-state">
          <p>No hay mecánicos registrados</p>
          <button className="btn-agregar-vacio" onClick={() => setMostrarFormulario(true)}>
            Registrar el primer mecánico
          </button>
        </div>
      ) : (
        <div className="mecanicos-grid">
          {mecanicosFiltrados.map(mecanico => (
            <div key={mecanico._id} className="mecanico-card">
              {mecanico.imagen ? (
                <img 
                  src={mecanico.imagen.startsWith('http') ? mecanico.imagen : `http://localhost:3000${mecanico.imagen}`} 
                  alt={mecanico.nombre}
                  className="mecanico-avatar-img"
                />
              ) : (
                <div className="mecanico-avatar">M</div>
              )}

              <div className="mecanico-body">
                <div className="mecanico-header">
                  <h3>{mecanico.nombre}</h3>
                  <span className={`disponibilidad ${mecanico.disponible ? 'disponible' : 'ocupado'}`}>
                    {mecanico.disponible ? 'Disponible' : 'Ocupado'}
                  </span>
                </div>

                <div className="mecanico-info">
                  <p><strong>Especialidad:</strong> {mecanico.especialidad}</p>
                  <p><strong>Email:</strong> {mecanico.correo}</p>
                  {mecanico.telefono && <p><strong>Teléfono:</strong> {mecanico.telefono}</p>}
                  {mecanico.horario && <p><strong>Horario:</strong> {mecanico.horario}</p>}
                  {mecanico.descripcion && <p><strong>Descripción:</strong> {mecanico.descripcion}</p>}
                </div>

                <div className="mecanico-acciones">
                  <button 
                    className={`btn-disponibilidad ${mecanico.disponible ? 'ocupar' : 'liberar'}`}
                    onClick={() => handleToggleDisponibilidad(mecanico._id, mecanico.disponible)}
                  >
                    {mecanico.disponible ? '⏸️ Pausar' : '▶️ Reactivar'}
                  </button>

                  <button className="btn-eliminar" onClick={() => handleEliminar(mecanico._id)}>
                    🗑️ Eliminar
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default MecanicotiendaTienda;
