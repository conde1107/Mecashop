// src/components/sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/sidebar.css"; // opcional, si quieres darle estilos separados

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">MecaShop</h2>
      <ul className="sidebar-menu">
        <li>
          <Link to="/dashboard"> Dashboard</Link>
        </li>
        <li>
          <Link to="/products"> Productos</Link>
        </li>
        <li>
          <Link to="/admin"> Admin Panel</Link>
        </li>
        <li>
          <Link to="/login"> Login</Link>
        </li>
        <li>
          <Link to="/register"> Registro</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
