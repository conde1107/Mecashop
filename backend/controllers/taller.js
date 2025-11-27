import Taller from "../models/taller.js";

// RF-003: Registro de taller
export const crearTaller = async (req, res) => {
  try {
    const { nombre, direccion, servicios, telefono } = req.body;
    const propietario = req.userId; // viene del token

    const nuevoTaller = new Taller({
      propietario,
      nombre,
      direccion,
      servicios,
      telefono,
    });

    await nuevoTaller.save();
    res.status(201).json({
      message: "Taller registrado correctamente",
      taller: nuevoTaller,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar el taller" });
  }
};
