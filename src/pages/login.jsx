//pages/login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineMail, AiOutlineLock } from "react-icons/ai";
import "../styles/login.css"; // asegúrate que esta ruta exista

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [errorMensaje, setErrorMensaje] = useState("");
  const [cuentaBloqueada, setCuentaBloqueada] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const navigate = useNavigate();

  // Contador de tiempo cuando la cuenta está bloqueada
  useEffect(() => {
    if (!cuentaBloqueada || tiempoRestante <= 0) return;

    const intervalo = setInterval(() => {
      setTiempoRestante((tiempo) => {
        if (tiempo <= 1) {
          setCuentaBloqueada(false);
          setErrorMensaje("");
          return 0;
        }
        return tiempo - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [cuentaBloqueada, tiempoRestante]);

  const formatearTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs < 10 ? '0' : ''}${segs}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cuentaBloqueada) {
      setErrorMensaje(`Cuenta bloqueada. Espera ${Math.ceil(tiempoRestante / 60)} minuto${Math.ceil(tiempoRestante / 60) > 1 ? 's' : ''} para intentar de nuevo.`);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role.toLowerCase());
        localStorage.setItem("userId", data.userId);
        if (onLogin) onLogin(data.role.toLowerCase());
        navigate(data.role.toLowerCase() === "admin" ? "/admin" : "/");
      } else {
        // Verificar si la cuenta está bloqueada
        console.log('Respuesta de error:', data);
        if (data.bloqueado) {
          console.log('Cuenta bloqueada detectada, tiempoRestante:', data.tiempoRestante);
          setCuentaBloqueada(true);
          setTiempoRestante(data.tiempoRestante || 30); // 30 segundos por defecto
          setErrorMensaje(data.error);
        } else {
          const nuevosIntentos = intentos + 1;
          setIntentos(nuevosIntentos);
          setErrorMensaje(
            nuevosIntentos >= 3
              ? "Has superado los 3 intentos. ¿Olvidaste tu contraseña?"
              : data.error || "Credenciales incorrectas"
          );
        }
      }
    } catch {
      setErrorMensaje("No se pudo conectar al servidor.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Título */}
        <h1 className="login-title">
          Meca<span className="highlight">Shop</span>
        </h1>
        <p className="login-subtitle">Accede a tu cuenta para continuar</p>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input-group">
            <label>Correo electrónico</label>
            <div className="input-wrapper">
              <AiOutlineMail className="icon" />
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={cuentaBloqueada}
              />
            </div>
          </div>

          <div className="login-input-group">
            <label>Contraseña</label>
            <div className="input-wrapper">
              <AiOutlineLock className="icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={cuentaBloqueada}
              />
            </div>
          </div>

          {errorMensaje && (
            <div className={`login-error-container ${cuentaBloqueada ? "bloqueado" : intentos >= 3 ? "danger" : "warning"}`}>
              <p className={`login-error ${cuentaBloqueada ? "bloqueado" : intentos >= 3 ? "danger" : "warning"}`}>
                {cuentaBloqueada 
                  ? "Cuenta bloqueada por intentos fallidos. Revisa tu correo para restablecer tu contraseña."
                  : errorMensaje
                }
              </p>
              {cuentaBloqueada && (
                <p className="timer">
                  ⏱️ Espera <span className="timer-value">{formatearTiempo(tiempoRestante)}</span> para reintentar
                </p>
              )}
            </div>
          )}

          <button type="submit" className="login-button" disabled={cuentaBloqueada}>
            {cuentaBloqueada ? "Cuenta bloqueada" : "Iniciar sesión"}
          </button>
        </form>

        <p className="login-footer">
          ¿Olvidaste tu contraseña?{" "}
          <span onClick={() => navigate("/forgot-password")}>
            Restablecer
          </span>
        </p>
      </div>
    </div>
  );
}
