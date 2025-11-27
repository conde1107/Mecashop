//pages/regisyter.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  
import "../styles/register.css";

function Register() {
  const navigate = useNavigate();  

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: formData.nombre,
        correo: formData.email,
        password: formData.password

      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert('Usuario registrado correctamente');
      navigate('/login');
    } else {
      alert('Error: ' + data.error);
    }
  } catch (error) {
    alert('Error al conectar con el servidor');
    console.error(error);
  }
};


  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Registrarse</h2>

        <label htmlFor="nombre">Nombre</label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Correo electrónico</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Registrarse</button>

        <p style={{ marginTop: "15px" }}>
          ¿Ya tienes cuenta?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
          >
            Inicia sesión
          </span>
        </p>
      </form>
    </div>
  );
}

export default Register;
