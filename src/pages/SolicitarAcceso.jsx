// src/pages/SolicitarAcceso.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/solicitarAcceso.css';

export default function SolicitarAcceso() {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    password: '',
    tipoUsuario: 'cliente',
    mensaje: ''
  });
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensaje('');

    console.log('📤 Datos del formulario a enviar:', formData);

    try {
      const response = await fetch('http://localhost:3000/api/solicitud-acceso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      console.log('📥 Respuesta del servidor:', response.status);

      const data = await response.json();

      if (response.ok) {
        setMensaje('Tu solicitud ha sido enviada correctamente. El administrador se pondrá en contacto contigo pronto.');
        setTipoMensaje('success');
        setFormData({
          nombre: '',
          correo: '',
          telefono: '',
          password: '',
          tipoUsuario: 'cliente',
          mensaje: ''
        });
      } else {
        setMensaje(data.msg || 'Error al enviar la solicitud. Intenta nuevamente.');
        setTipoMensaje('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('Error de conexión. Por favor, intenta nuevamente.');
      setTipoMensaje('error');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="solicitar-acceso-container">
      <div className="solicitar-acceso-card">
        <h1 className="solicitar-acceso-title">Solicitar Acceso a MecaShop</h1>
        <p className="solicitar-acceso-subtitle">
          Completa el formulario y el administrador revisará tu solicitud para crear tu cuenta
        </p>

        <form onSubmit={handleSubmit} className="solicitar-acceso-form">
          <div className="form-group-acceso">
            <label className="form-label-acceso">Nombre Completo *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              required
              className="form-input-acceso"
            />
          </div>

          <div className="form-group-acceso">
            <label className="form-label-acceso">Correo Electrónico *</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="tu@correo.com"
              required
              className="form-input-acceso"
            />
          </div>

          <div className="form-group-acceso">
            <label className="form-label-acceso">Teléfono *</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="3001234567"
              required
              className="form-input-acceso"
            />
          </div>

          <div className="form-group-acceso">
            <label className="form-label-acceso">Contraseña *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Tu contraseña"
              required
              minLength="6"
              className="form-input-acceso"
            />
          </div>

          <div className="form-group-acceso">
            <label className="form-label-acceso">Tipo de Usuario *</label>
            <select
              name="tipoUsuario"
              value={formData.tipoUsuario}
              onChange={handleChange}
              required
              className="form-select-acceso"
            >
              <option value="cliente">Cliente</option>
              <option value="mecanico">Mecánico</option>
              <option value="tienda">Tienda</option>
            </select>
          </div>

          <div className="form-group-acceso">
            <label className="form-label-acceso">Mensaje (Opcional)</label>
            <textarea
              name="mensaje"
              value={formData.mensaje}
              onChange={handleChange}
              placeholder="Cuéntanos por qué deseas unirte a MecaShop..."
              rows="4"
              className="form-textarea-acceso"
            />
          </div>

          <button type="submit" disabled={enviando} className="btn-submit-acceso">
            {enviando ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </form>

        {mensaje && (
          <div className={`mensaje-box ${tipoMensaje === 'success' ? 'mensaje-success' : 'mensaje-error'}`}>
            {mensaje}
          </div>
        )}

        <p className="back-to-login-acceso">
          ¿Ya tienes una cuenta?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="back-to-login-btn-acceso"
          >
            Iniciar sesión
          </button>
        </p>
      </div>
    </div>
  );
}
