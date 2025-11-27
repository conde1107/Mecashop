const Usuario = require("../models/usuario");

// ========================
// FILTRAR USUARIOS PARA EL DIRECTORIO
// ========================
exports.filtrarDirectorio = async (req, res) => {
  try {
    const { rol, nombre, especialidad, estado } = req.query;

    // Filtro base: usuarios activos
    let filtro = { activo: true };

    // Filtrar por rol
    if (rol && rol !== "todos") {
      filtro.rol = rol.toLowerCase();
    } else {
      filtro.rol = { $in: ["mecanico", "tienda"] };
    }

    // Filtrar por nombre
    if (nombre) {
      filtro.nombre = { $regex: nombre, $options: "i" };
    }

    // Determinar si el rol incluye mecánico
    const esMecanico =
      filtro.rol === "mecanico" ||
      (filtro.rol.$in && filtro.rol.$in.includes("mecanico"));

    if (esMecanico) {
      // Filtrar por disponibilidad
      if (estado === "Disponible") filtro.disponible = true;
      if (estado === "Pausado") filtro.disponible = false;

      // Filtrar por especialidad
      if (especialidad) {
        filtro.especialidad = { $regex: especialidad, $options: "i" };
      }
    }

    // Consultar la base de datos
    const usuarios = await Usuario.find(filtro)
      .select(
        "nombre rol descripcion imagen especialidad zona direccion telefono disponible horario"
      )
      .lean();

    // Mapear disponibilidad para frontend
    const resultadoFinal = usuarios.map((u) => ({
      ...u,
      disponibilidad:
        u.rol === "mecanico" ? (u.disponible ? "Disponible" : "Pausado") : undefined,
    }));

    res.json(resultadoFinal);
  } catch (error) {
    console.error("[filtrarDirectorio] Error:", error);
    res.status(500).json({ error: "Error al filtrar directorio" });
  }
};

// ========================
// OBTENER USUARIO POR ID
// ========================
exports.obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findById(id)
      .select(
        "nombre rol descripcion imagen especialidad zona direccion telefono disponible horario"
      )
      .lean();

    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    if (usuario.rol === "mecanico") {
      usuario.disponibilidad = usuario.disponible ? "Disponible" : "Pausado";
    }

    res.json(usuario);
  } catch (error) {
    console.error("[obtenerUsuarioPorId] Error:", error.message);
    res.status(500).json({ error: "Error al obtener usuario", detalle: error.message });
  }
};
