// src/components/logoutbutton.jsx
import { useNavigate } from 'react-router-dom';

const LogoutButton = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpiar almacenamiento local
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    // Ejecutar función que actualiza estado global
    onLogout();

    // Redirigir a login
    navigate('/login');
  };

  return (
    <button onClick={handleLogout}>
      Cerrar sesión
    </button>
  );
};

export default LogoutButton;
