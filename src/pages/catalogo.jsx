//pages/catalogo.jsx
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/catalogo.css';

const API_URL = 'http://localhost:3000/api/productos';
const API_BASE = 'http://localhost:3000';

const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroInventario, setFiltroInventario] = useState('todos');
  const [ordenar, setOrdenar] = useState('nombre');
  const [infoTienda, setInfoTienda] = useState({
    nombre: 'Mi Tienda',
    descripcion: 'Bienvenido a nuestra tienda de productos y servicios',
    telefono: '',
    email: ''
  });
  
  // Estados para agregar producto (solo tienda)
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [producto, setProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    inventario: '',
    imagen: null
  });
  const [previewImagen, setPreviewImagen] = useState(null);
  const [guardando, setGuardando] = useState(false);
  
  // Estados para editar producto
  const [editandoId, setEditandoId] = useState(null);
  const [productoEditando, setProductoEditando] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    inventario: '',
    imagen: null
  });
  const [previewImagenEditar, setPreviewImagenEditar] = useState(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  
  // Detectar si el usuario es tienda
  const role = localStorage.getItem('role');
  const esTienda = role === 'tienda';
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    cargarProductos();
    cargarInfoTienda();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Error al cargar productos');
      const data = await res.json();
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.error('Error al cargar el catálogo');
    } finally {
      setCargando(false);
    }
  };

  const cargarInfoTienda = () => {
    const infoGuardada = localStorage.getItem('infoTienda');
    if (infoGuardada) {
      setInfoTienda(JSON.parse(infoGuardada));
    }
  };

  const productosFiltrados = productos
    .filter(p => {
      const coincideNombre = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const coincideInventario = 
        filtroInventario === 'todos' || 
        (filtroInventario === 'disponibles' && p.inventario > 0) ||
        (filtroInventario === 'agotados' && p.inventario === 0);
      return coincideNombre && coincideInventario;
    })
    .sort((a, b) => {
      switch (ordenar) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'precio-menor':
          return parseFloat(a.precio) - parseFloat(b.precio);
        case 'precio-mayor':
          return parseFloat(b.precio) - parseFloat(a.precio);
        case 'stock':
          return b.inventario - a.inventario;
        default:
          return 0;
      }
    });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'imagen') {
      const archivo = files[0];
      if (archivo && !['image/jpeg', 'image/png', 'image/jpg'].includes(archivo.type)) {
        toast.error('Solo se permiten imágenes JPG o PNG');
        return;
      }
      setProducto({ ...producto, imagen: archivo });
      if (archivo) {
        setPreviewImagen(URL.createObjectURL(archivo));
      }
    } else {
      setProducto({ ...producto, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!producto.nombre.trim() || !producto.precio || !producto.inventario) {
      toast.warning('Por favor completa los campos obligatorios');
      return;
    }

    const precioNum = parseFloat(producto.precio);
    const inventarioNum = parseInt(producto.inventario);
    if (isNaN(precioNum) || isNaN(inventarioNum) || precioNum <= 0 || inventarioNum < 0) {
      toast.error('Precio debe ser positivo e inventario no negativo');
      return;
    }

    try {
      setGuardando(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Debes estar logueado para agregar productos');
        setGuardando(false);
        return;
      }

      const formData = new FormData();
      formData.append('nombre', producto.nombre.trim());
      formData.append('descripcion', producto.descripcion.trim() || '');
      formData.append('precio', producto.precio);
      formData.append('inventario', producto.inventario);
      if (producto.imagen) formData.append('imagen', producto.imagen);

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al guardar el producto');
      }

      const nuevoProducto = await res.json();
      setProductos([nuevoProducto, ...productos]);
      toast.success(' Producto agregado correctamente');
      setProducto({ nombre: '', descripcion: '', precio: '', inventario: '', imagen: null });
      setPreviewImagen(null);
      setMostrarFormulario(false);
    } catch (error) {
      console.error('Error al guardar producto:', error);
      toast.error(`❌ ${error.message || 'Error al guardar el producto'}`);
    } finally {
      setGuardando(false);
    }
  };

  const stats = {
    total: productos.length,
    disponibles: productos.filter(p => p.inventario > 0).length,
    agotados: productos.filter(p => p.inventario === 0).length,
  };

  //  Abrir modal de edición
  const abrirEdicion = (prod) => {
    setEditandoId(prod._id);
    setProductoEditando({
      nombre: prod.nombre,
      descripcion: prod.descripcion || '',
      precio: prod.precio.toString(),
      inventario: prod.inventario.toString(),
      imagen: null
    });
    setPreviewImagenEditar(prod.imagenURL ? `${API_BASE}${prod.imagenURL}` : null);
  };

  //  Cancelar edición
  const cancelarEdicion = () => {
    setEditandoId(null);
    setProductoEditando({
      nombre: '',
      descripcion: '',
      precio: '',
      inventario: '',
      imagen: null
    });
    setPreviewImagenEditar(null);
  };

  //  Manejar cambios en el formulario de edición
  const handleChangeEditar = (e) => {
    const { name, value, files } = e.target;

    if (name === 'imagen') {
      const archivo = files[0];
      if (archivo && !['image/jpeg', 'image/png', 'image/jpg'].includes(archivo.type)) {
        toast.error('Solo se permiten imágenes JPG o PNG');
        return;
      }
      setProductoEditando({ ...productoEditando, imagen: archivo });
      if (archivo) {
        setPreviewImagenEditar(URL.createObjectURL(archivo));
      }
    } else {
      setProductoEditando({ ...productoEditando, [name]: value });
    }
  };

  //  Guardar edición
  const handleGuardarEdicion = async (e) => {
    e.preventDefault();

    if (!productoEditando.nombre.trim() || !productoEditando.precio || !productoEditando.inventario) {
      toast.warning('Por favor completa los campos obligatorios');
      return;
    }

    const precioNum = parseFloat(productoEditando.precio);
    const inventarioNum = parseInt(productoEditando.inventario);
    if (isNaN(precioNum) || isNaN(inventarioNum) || precioNum <= 0 || inventarioNum < 0) {
      toast.error('Precio debe ser positivo e inventario no negativo');
      return;
    }

    try {
      setGuardandoEdicion(true);

      const formData = new FormData();
      formData.append('nombre', productoEditando.nombre.trim());
      formData.append('descripcion', productoEditando.descripcion.trim() || '');
      formData.append('precio', productoEditando.precio);
      formData.append('inventario', productoEditando.inventario);
      if (productoEditando.imagen) formData.append('imagen', productoEditando.imagen);

      console.log(' Enviando actualización del producto...');

      const res = await fetch(`${API_URL}/${editandoId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      console.log(' Respuesta del servidor:', res.status);

      // Primero clonamos la respuesta para poder leerla dos veces si es necesario
      let productoActualizado;
      
      if (!res.ok) {
        try {
          const errorData = await res.json();
          throw new Error(errorData.error || `Error al actualizar (${res.status})`);
        } catch (e) {
          if (e.message.includes('SyntaxError') || e.message.includes('JSON')) {
            throw new Error(`Error del servidor (${res.status}): Respuesta inválida`);
          }
          throw e;
        }
      }

      productoActualizado = await res.json();
      setProductos(productos.map(p => p._id === editandoId ? productoActualizado : p));
      toast.success(' Producto actualizado correctamente');
      cancelarEdicion();
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      toast.error(`❌ ${error.message || 'Error al actualizar el producto'}`);
    } finally {
      setGuardandoEdicion(false);
    }
  };

  //  Eliminar producto
  const handleEliminar = async (productoId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/${productoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al eliminar el producto');
      }

      setProductos(productos.filter(p => p._id !== productoId));
      toast.success(' Producto eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error(`❌ ${error.message || 'Error al eliminar el producto'}`);
    }
  };

  return (
    <div className="catalogo-page">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER CON INFORMACIÓN DE TIENDA */}
      <div className="catalogo-header">
        <div className="tienda-info">
          <h1>{infoTienda.nombre}</h1>
          <p>{infoTienda.descripcion}</p>
          <div className="tienda-contacto">
            {infoTienda.telefono && (
              <span>{infoTienda.telefono}</span>
            )}
            {infoTienda.email && (
              <span>{infoTienda.email}</span>
            )}
          </div>
        </div>
        {esTienda && (
          <button 
            className="btn-agregar-producto"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            {mostrarFormulario ? 'Cerrar' : 'Agregar Producto'}
          </button>
        )}
      </div>

      {/* FORMULARIO AGREGAR PRODUCTO (SOLO TIENDA) */}
      {esTienda && mostrarFormulario && (
        <div className="formulario-section">
          <h2>Agregar Nuevo Producto</h2>
          <form className="formulario-producto-v2" onSubmit={handleSubmit}>
            <div className="form-columns">
              <div className="form-column">
                <div className="form-group">
                  <label>Nombre del Producto *</label>
                  <input 
                    type="text" 
                    name="nombre" 
                    value={producto.nombre} 
                    onChange={handleChange}
                    placeholder="Ej: Aceite de motor 10W40"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea 
                    name="descripcion" 
                    value={producto.descripcion} 
                    onChange={handleChange}
                    placeholder="Describe el producto con detalles..."
                    rows={4}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Precio ($ COP) *</label>
                    <input 
                      type="number" 
                      name="precio" 
                      value={producto.precio} 
                      onChange={handleChange}
                      min="0"
                      step="1000"
                      placeholder="Ej: 50000"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Inventario *</label>
                    <input 
                      type="number" 
                      name="inventario" 
                      value={producto.inventario} 
                      onChange={handleChange}
                      min="0"
                      placeholder="Ej: 25"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-column">
                <div className="form-group">
                  <label>Imagen (JPG / PNG)</label>
                  <div className="file-upload">
                    <input 
                      type="file" 
                      name="imagen" 
                      accept="image/jpeg, image/png, image/jpg"
                      onChange={handleChange}
                      id="imagen-input"
                    />
                    <label htmlFor="imagen-input" className="file-label">
                      <span> Seleccionar Imagen</span>
                    </label>
                  </div>

                  {previewImagen && (
                    <div className="preview-container">
                      <img src={previewImagen} alt="Preview" className="preview-img" />
                      <button 
                        className="btn-remove-preview"
                        onClick={() => {
                          setPreviewImagen(null);
                          setProducto({ ...producto, imagen: null });
                        }}
                      >
                        X
                      </button>
                    </div>
                  )}
                </div>

                <button type="submit" disabled={guardando} className="btn-submit">
                  {guardando ? 'Guardando...' : 'Agregar Producto'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* MODAL EDITAR PRODUCTO */}
      {editandoId && (
        <div className="modal-overlay" onClick={cancelarEdicion}>
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Producto</h2>
              <button className="btn-cerrar-modal" onClick={cancelarEdicion}>X</button>
            </div>

            <form className="formulario-producto-v2" onSubmit={handleGuardarEdicion}>
              <div className="form-group">
                <label>Nombre del Producto *</label>
                <input 
                  type="text" 
                  name="nombre" 
                  value={productoEditando.nombre} 
                  onChange={handleChangeEditar}
                  placeholder="Ej: Aceite de motor 10W40"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea 
                  name="descripcion" 
                  value={productoEditando.descripcion} 
                  onChange={handleChangeEditar}
                  placeholder="Describe el producto con detalles..."
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label>Precio ($ COP) *</label>
                <input 
                  type="number" 
                  name="precio" 
                  value={productoEditando.precio} 
                  onChange={handleChangeEditar}
                  min="0"
                  step="1000"
                  placeholder="Ej: 50000"
                  required
                />
              </div>

              <div className="form-group">
                <label>Inventario *</label>
                <input 
                  type="number" 
                  name="inventario" 
                  value={productoEditando.inventario} 
                  onChange={handleChangeEditar}
                  min="0"
                  placeholder="Ej: 25"
                  required
                />
              </div>

              <div className="form-group">
                <label>Imagen (JPG / PNG)</label>
                <div className="file-upload">
                  <input 
                    type="file" 
                    name="imagen" 
                    accept="image/jpeg, image/png, image/jpg"
                    onChange={handleChangeEditar}
                    id="imagen-input-editar"
                  />
                  <label htmlFor="imagen-input-editar" className="file-label">
                    <span> Seleccionar Imagen</span>
                  </label>
                </div>

                {previewImagenEditar && (
                  <div className="preview-container">
                    <img src={previewImagenEditar} alt="Preview" className="preview-img" />
                    <button 
                      className="btn-remove-preview"
                      onClick={() => {
                        setPreviewImagenEditar(null);
                        setProductoEditando({ ...productoEditando, imagen: null });
                      }}
                    >
                      X
                    </button>
                  </div>
                )}
              </div>

              <div className="modal-botones">
                <button type="submit" disabled={guardandoEdicion} className="btn-submit">
                  {guardandoEdicion ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button type="button" className="btn-cancelar" onClick={cancelarEdicion}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* STATS */}
      <div className="catalogo-stats">
        <div className="stat-box">
          <div>
            <p className="stat-label">Productos</p>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="stat-box">
          <div>
            <p className="stat-label">Disponibles</p>
            <p className="stat-value">{stats.disponibles}</p>
          </div>
        </div>
        <div className="stat-box">
          <div>
            <p className="stat-label">Agotados</p>
            <p className="stat-value">{stats.agotados}</p>
          </div>
        </div>
      </div>

      {/* CONTROLES DE BÚSQUEDA Y FILTRO */}
      <div className="catalogo-controles">
        <div className="search-box">
          <input 
            type="text"
            placeholder=" Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filtros-box">
          <select 
            value={filtroInventario} 
            onChange={(e) => setFiltroInventario(e.target.value)}
            className="select-filtro"
          >
            <option value="todos">Todos los productos</option>
            <option value="disponibles">Disponibles</option>
            <option value="agotados">Agotados</option>
          </select>

          <select 
            value={ordenar} 
            onChange={(e) => setOrdenar(e.target.value)}
            className="select-filtro"
          >
            <option value="nombre">Ordenar por nombre</option>
            <option value="precio-menor">Precio: Menor a Mayor</option>
            <option value="precio-mayor">Precio: Mayor a Menor</option>
            <option value="stock">Mayor Stock</option>
          </select>
        </div>
      </div>

      {/* GRID DE PRODUCTOS */}
      <div className="catalogo-container">
        {cargando ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Cargando productos...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="empty-state">
            <p> No hay productos disponibles</p>
            {searchTerm && <p>Intenta con otra búsqueda</p>}
          </div>
        ) : (
          <div className="productos-grid">
            {productosFiltrados.map((producto) => (
              <div key={producto._id} className="producto-item">
                <div className="producto-imagen">
           <img
  src={producto.imagenURL || '/img/default-product.png'}
  alt={producto.nombre}
  onError={(e) => { e.target.src = '/img/default-product.png'; }}
/>

                  <div className={`producto-badge ${producto.inventario === 0 ? 'agotado' : 'disponible'}`}>
                    {producto.inventario === 0 ? 'AGOTADO' : `${producto.inventario} en stock`}
                  </div>
                </div>

                <div className="producto-contenido">
                  <h3>{producto.nombre}</h3>
                  {producto.descripcion && (
                    <p className="producto-descripcion">{producto.descripcion}</p>
                  )}

                  <div className="producto-info">
                    <span className="producto-precio">
                      ${parseFloat(producto.precio).toLocaleString('es-CO')}
                    </span>
                  </div>

                  {esTienda && (
                    <div className="producto-acciones">
                      <button 
                        className="btn-editar"
                        onClick={() => abrirEdicion(producto)}
                        title="Editar"
                      >
                        Editar
                      </button>
                      <button 
                        className="btn-eliminar"
                        onClick={() => handleEliminar(producto._id)}
                        title="Eliminar"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalogo;
