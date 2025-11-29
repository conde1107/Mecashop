const Usuario = require("../models/usuario");

// ========================
// FILTRAR USUARIOS PARA EL DIRECTORIO
// ========================
exports.filtrarDirectorio = async (req, res) => {
  try {
    const { rol, nombre, especialidad, estado } = req.query;

    let filtro = { activo: true };

    if (rol && rol !== "todos") {
      filtro.rol = rol.toLowerCase();
    } else {
      filtro.rol = { $in: ["mecanico", "tienda"] };
    }

    if (nombre) {
      filtro.nombre = { $regex: nombre, $options: "i" };
    }

    const esMecanico =
      filtro.rol === "mecanico" ||
      (filtro.rol.$in && filtro.rol.$in.includes("mecanico"));

    if (esMecanico) {
      if (estado === "Disponible") filtro.disponible = true;
      if (estado === "Pausado") filtro.disponible = false;

      if (especialidad) {
        filtro.especialidad = { $regex: especialidad, $options: "i" };
      }
    }

    const usuarios = await Usuario.find(filtro)
      .select(
        "nombre rol descripcion imagen especialidad zona direccion telefono disponible horario"
      )
      .lean();

    // Solo asegurarnos que cada usuario tenga imagen (Cloudinary o null)
    const resultadoFinal = usuarios.map((u) => ({
      ...u,
      imagen: u.imagen || null,
      disponibilidad: u.rol === "mecanico" ? (u.disponible ? "Disponible" : "Pausado") : undefined,
      horario: u.horario || "No registrado",
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

    const usuarioNormalizado = {
      ...usuario,
      imagen: usuario.imagen || null,
      disponibilidad: usuario.rol === "mecanico" ? (usuario.disponible ? "Disponible" : "Pausado") : undefined,
      horario: usuario.horario || "No registrado",
    };

    res.json(usuarioNormalizado);
  } catch (error) {
    console.error("[obtenerUsuarioPorId] Error:", error.message);
    res.status(500).json({ error: "Error al obtener usuario", detalle: error.message });
  }
};
