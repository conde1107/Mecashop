//pages/forgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/forgotPassword.css';

export default function ForgotPassword() {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipo, setTipo] = useState(''); // 'success' o 'error'
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      });

      const data = await response.json();
      if (response.ok) {
        setMensaje(data.msg || 'Correo enviado. Revisa tu bandeja de entrada.');
        setTipo('success');
        setCorreo('');
      } else {
        setMensaje(data.msg || 'Error al enviar el correo.');
        setTipo('error');
      }
    } catch (error) {
      console.error(error);
      setMensaje('Error de conexión con el servidor.');
      setTipo('error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2 className="forgot-password-title">Recuperar contraseña</h2>
        <p className="forgot-password-subtitle">Ingresa tu correo registrado para recibir un enlace de recuperación.</p>
        
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group-forgot">
            <label className="form-label-forgot">
              Correo electrónico
            </label>
            <input 
              type="email" 
              value={correo} 
              onChange={(e) => setCorreo(e.target.value)} 
              placeholder="tu@correo.com"
              required
              className="form-input-forgot"
            />
          </div>

          <button 
            type="submit" 
            disabled={cargando}
            className="btn-submit-forgot"
          >
            {cargando ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>

        {mensaje && (
          <div className={`message-box ${tipo === 'success' ? 'message-success' : 'message-error'}`}>
            {mensaje}
          </div>
        )}

        <p className="back-to-login">
          ¿Recordaste tu contraseña?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="back-to-login-btn"
          >
            Volver al inicio de sesión
          </button>
        </p>
      </div>
    </div>
  );
}
