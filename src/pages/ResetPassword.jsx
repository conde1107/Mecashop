//pages/resetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ResetPassword.css';

export default function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipo, setTipo] = useState(''); // 'success' o 'error'
  const [cargando, setCargando] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(600); // 10 minutos en segundos
  const [tokenValido, setTokenValido] = useState(true);
  const navigate = useNavigate();

  // Verificar si el token es válido y contar el tiempo
  useEffect(() => {
    const verificarToken = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/password/verify-token/${token}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          setTokenValido(false);
          setMensaje('El enlace ha expirado o es inválido.');
          setTipo('error');
        }
      } catch (error) {
        console.error(error);
        setTokenValido(false);
        setMensaje('Error verificando el token.');
        setTipo('error');
      }
    };

    verificarToken();
  }, [token]);

  // Iniciar el contador de tiempo
  useEffect(() => {
    if (!tokenValido) return;

    const intervalo = setInterval(() => {
      setTiempoRestante((tiempo) => {
        if (tiempo <= 1) {
          setTokenValido(false);
          setMensaje('El enlace ha expirado. Solicita un nuevo restablecimiento.');
          setTipo('error');
          clearInterval(intervalo);
          return 0;
        }
        return tiempo - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [tokenValido]);

  const formatearTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs < 10 ? '0' : ''}${segs}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (!tokenValido) {
      setMensaje('El enlace ha expirado. Solicita un nuevo restablecimiento.');
      setTipo('error');
      return;
    }

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setMensaje('Las contraseñas no coinciden.');
      setTipo('error');
      return;
    }

    // Validar longitud mínima
    if (newPassword.length < 8) {
      setMensaje('La contraseña debe tener al menos 8 caracteres.');
      setTipo('error');
      return;
    }

    setCargando(true);

    try {
      const response = await fetch(`http://localhost:3000/api/password/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setMensaje('Contraseña restablecida correctamente. Serás redirigido al login...');
        setTipo('success');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMensaje(data.msg || 'Error al restablecer contraseña.');
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
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2 className="reset-password-title">
          Restablecer <span className="highlight">contraseña</span>
        </h2>
        <p className="reset-password-subtitle">Ingresa una nueva contraseña para tu cuenta.</p>
        
        {/* Indicador de tiempo restante */}
        {tokenValido && (
          <div className="reset-password-timer-container">
            <p className="reset-password-timer">
              ⏱️ Tiempo restante: <span className="reset-password-timer-value">{formatearTiempo(tiempoRestante)}</span>
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="reset-password-input-group">
            <label>Nueva contraseña</label>
            <div className="reset-password-input-wrapper">
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="Mínimo 8 caracteres"
                required
                disabled={!tokenValido}
              />
            </div>
          </div>

          <div className="reset-password-input-group">
            <label>Confirmar contraseña</label>
            <div className="reset-password-input-wrapper">
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Repite tu contraseña"
                required
                disabled={!tokenValido}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={cargando || !tokenValido}
            className="reset-password-button"
          >
            {cargando ? 'Procesando...' : 'Cambiar contraseña'}
          </button>
        </form>

        {mensaje && (
          <div className={`reset-password-message-container ${tipo}`}>
            <p className={`reset-password-message ${tipo}`}>
              {mensaje}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
