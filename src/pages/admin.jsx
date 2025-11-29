// pages/admin.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";

const Admin = () => {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rol, setRol] = useState("cliente");
  const [especialidad, setEspecialidad] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");

  const navigate = useNavigate();

  // 🧩 Cargar usuarios al montar
  useEffect(() => {
    cargarUsuarios();
  }, []);
  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("correo", correo);
    formData.append("password", contraseña);
    formData.append("rol", rol);
    formData.append("telefono", telefono);
    if (rol === "mecanico") {
      if (!especialidad || !especialidad.trim()) {
        alert("La especialidad es obligatoria para usuarios con rol mecánico.");
        return;
      }
      formData.append("especialidad", especialidad.trim().toLowerCase());
    }

    if (pdfFile && (rol === "mecanico" || rol === "tienda")) {
      formData.append("pdf", pdfFile);
    }

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "No se pudo crear el usuario"}`);
        return;
      }

      alert("Usuario creado exitosamente.");

      if (rol === "mecanico") navigate("/mecanicoDashboard");
      else if (rol === "tienda") navigate("/tiendaDashboard");

      setNombre("");
      setCorreo("");
      setContraseña("");
      setTelefono("");
      setRol("cliente");
      setEspecialidad("");
      setPdfFile(null);
      cargarUsuarios();
    } catch (error) {
      console.error("Error al crear usuario:", error);
      alert("Error al conectar con el servidor");
    }
  };

  //  Cargar todos los usuarios
  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/admin/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      alert("Error al conectar con el servidor");
    } finally {
      setCargando(false);
    }
  };

  //  Cambiar rol
  const handleModificarRol = async (id, nuevoRol) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3000/api/admin/usuarios/${id}/rol`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rol: nuevoRol }),
        }
      );

      if (!res.ok) throw new Error("Error al actualizar rol");

      alert("Rol actualizado correctamente");
      cargarUsuarios();
    } catch (error) {
      console.error("Error al modificar rol:", error);
      alert("No se pudo modificar el rol");
    }
  };

  // === EDITAR USUARIO (ADMIN) ===
  const handleStartEdit = (user) => {
    // Crear copia para editar
    setEditingUser({
      _id: user._id,
      nombre: user.nombre || "",
      correo: user.correo || "",
      telefono: user.telefono || "",
      direccion: user.direccion || "",
      rol: user.rol || "cliente",
      especialidad: user.especialidad || "",
      activo: user.activo === undefined ? true : user.activo,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingUser((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveEdit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editingUser) return;
    try {
      const token = localStorage.getItem('token');
      const payload = {
        nombre: editingUser.nombre,
        correo: editingUser.correo,
        telefono: editingUser.telefono,
        direccion: editingUser.direccion,
        rol: editingUser.rol,
        especialidad: editingUser.rol === 'mecanico' ? editingUser.especialidad : '',
        activo: editingUser.activo,
      };

      // Construir URL manualmente y loguear antes de la petición
      const url = 'http://localhost:3000/api/admin/usuarios/' + editingUser._id;
      console.log('[admin.handleSaveEdit] URL:', url);
      console.log('[admin.handleSaveEdit] payload:', payload);

      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = text; }

      if (!res.ok) {
        console.error('[handleSaveEdit] error:', res.status, data);
        // Mostrar el cuerpo de respuesta para depuración
        alert('Error del servidor: ' + (typeof data === 'string' ? data : JSON.stringify(data)));
        return;
      }

      alert('Usuario actualizado correctamente');
      setEditingUser(null);
      setFiltroRol('todos');
      cargarUsuarios();
    } catch (error) {
      console.error('Error al guardar usuario editado:', error);
      alert('Error al guardar');
    }
  };

  const handleCancelEdit = () => setEditingUser(null);

  //  Activar / Desactivar usuario
  const handleToggleActivo = async (id, estadoActual) => {
    try {
      const token = localStorage.getItem("token");
      const nuevoEstado = !estadoActual;

      const res = await fetch(
        `http://localhost:3000/api/admin/usuarios/${id}/estado`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ activo: nuevoEstado }),
        }
      );

      if (!res.ok) throw new Error("Error al actualizar estado");

      alert(nuevoEstado ? "Usuario activado" : "Usuario desactivado");
      cargarUsuarios();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("No se pudo cambiar el estado del usuario");
    }
  };

  //  Eliminar usuario
  const handleEliminarUsuario = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3000/api/admin/usuarios/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Error al eliminar usuario");

      alert("Usuario eliminado correctamente");
      cargarUsuarios();
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar el usuario");
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Panel de Administrador</h1>
        <p>Gestiona usuarios, roles y permisos</p>
      </header>

      <div className="admin-content">
        {/* SECCIÓN: CREAR USUARIO */}
        <section className="admin-section crear-usuario-section">
          <h2>Crear Nuevo Usuario</h2>
          <form className="admin-form crear-form" onSubmit={handleCrearUsuario}>
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div className="form-group">
                <label>Correo *</label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="usuario@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Teléfono *</label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="3001234567"
                  required
                />
              </div>

              <div className="form-group">
                <label>Contraseña *</label>
                <input
                  type="password"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="form-group">
                <label>Rol *</label>
                <select value={rol} onChange={(e) => setRol(e.target.value)} required>
                  <option value="cliente">Cliente</option>
                  <option value="mecanico">Mecánico</option>
                  <option value="tienda">Tienda</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {rol === "mecanico" && (
                <div className="form-group">
                  <label>Especialidad *</label>
                  <input
                    type="text"
                    value={especialidad}
                    onChange={(e) => setEspecialidad(e.target.value)}
                    placeholder="Ej: latonero, pintura, eléctrico"
                    required
                  />
                </div>
              )}

              {(rol === "mecanico" || rol === "tienda") && (
                <div className="form-group">
                  <label>Documento PDF</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setPdfFile(e.target.files[0])}
                  />
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary">
              Crear Usuario
            </button>
          </form>
        </section>

        {/* SECCIÓN: EDITAR USUARIO */}
        {editingUser && (
          <section className="admin-section edit-user-section">
            <h2>Editar Usuario</h2>
            <form onSubmit={handleSaveEdit} className="admin-form edit-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    name="nombre"
                    value={editingUser.nombre}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Correo</label>
                  <input
                    name="correo"
                    type="email"
                    value={editingUser.correo}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    name="telefono"
                    value={editingUser.telefono}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="form-group">
                  <label>Dirección</label>
                  <input
                    name="direccion"
                    value={editingUser.direccion}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="form-group">
                  <label>Rol</label>
                  <select name="rol" value={editingUser.rol} onChange={handleEditChange}>
                    <option value="cliente">Cliente</option>
                    <option value="mecanico">Mecánico</option>
                    <option value="tienda">Tienda</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                {editingUser.rol === "mecanico" && (
                  <div className="form-group">
                    <label>Especialidad</label>
                    <input
                      name="especialidad"
                      value={editingUser.especialidad}
                      onChange={handleEditChange}
                    />
                  </div>
                )}

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      name="activo"
                      type="checkbox"
                      checked={!!editingUser.activo}
                      onChange={handleEditChange}
                    />
                    <span>Usuario Activo</span>
                  </label>
                </div>
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn btn-success">
                   Guardar Cambios
                </button>
                <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">
                   Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        {/* SECCIÓN: LISTA DE USUARIOS */}
        <section className="admin-section usuarios-section">
          <div className="usuarios-header">
            <h2>👥 Usuarios Registrados</h2>
            <button onClick={cargarUsuarios} className="btn btn-secondary" disabled={cargando}>
              {cargando ? "🔄 Cargando..." : "🔄 Recargar"}
            </button>
          </div>

          {/* FILTROS */}
        <div className="filtros">
  <div className="filtro-grupo">
    <input
      type="text"
      placeholder="Buscar por nombre o correo..."
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      className="input-busqueda"
    />
  </div>
  <div className="filtro-grupo">
    <select
      value={filtroRol}
      onChange={(e) => setFiltroRol(e.target.value)}
      className="select-filtro"
    >
      <option value="todos">Todos los roles</option>
      <option value="cliente">Cliente</option>
      <option value="mecanico">Mecánico</option>
      <option value="tienda">Tienda</option>
      <option value="admin">Administrador</option>
    </select>
  </div>
</div>

          {/* TABLA RESPONSIVA */}
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th>Especialidad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
              {usuarios.length > 0 ? (
  usuarios
    .filter((u) => {
      // Filtrar por rol
      const rolCoincide =
        filtroRol === "todos" || u.rol.toLowerCase() === filtroRol.toLowerCase();

      // Filtrar por búsqueda en nombre o correo
      const busquedaCoincide =
        busqueda === "" ||
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.correo.toLowerCase().includes(busqueda.toLowerCase());

      return rolCoincide && busquedaCoincide;
    })
                    .map((u) => (
                      <tr key={u._id} className={u.activo ? "" : "inactivo"}>
                        <td className="nombre-cell">
                          <strong>{u.nombre}</strong>
                        </td>
                        <td className="email-cell">{u.correo}</td>
                        <td className="telefono-cell">{u.telefono || "—"}</td>
                        <td className="rol-cell">
                          <span className="badge">
                            {u.rol?.trim() || '—'}
                          </span>
                        </td>
                        <td className="especialidad-cell">
                          {u.rol === "mecanico" ? u.especialidad || "—" : "—"}
                        </td>
                        <td className="estado-cell">
                          <span className={`estado ${u.activo ? "activo" : "inactivo"}`}>
                            {u.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="acciones-cell">
                          <button
                            className="btn btn-xs btn-toggle"
                            onClick={() => handleToggleActivo(u._id, u.activo)}
                            title={u.activo ? "Desactivar" : "Activar"}
                          >
                            {u.activo ? "⏸" : "▶"}
                          </button>
                          <button
                            className="btn btn-xs btn-edit"
                            onClick={() => handleStartEdit(u)}
                            title="Editar"
                          >
                            ✎
                          </button>
                          <button
                            className="btn btn-xs btn-delete"
                            onClick={() => handleEliminarUsuario(u._id)}
                            title="Eliminar"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      {cargando ? "Cargando usuarios..." : "No hay usuarios para mostrar"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="tabla-info">
            Total: <strong>{usuarios.length}</strong> usuarios
          </p>
        </section>
      </div>
    </div>
  );
};

export default Admin;