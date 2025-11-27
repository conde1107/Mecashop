// Script para rellenar especialidad vacía en mecánicos
require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('./models/usuario');

const MONGODB_URI = process.env.MONGODB_URI;

async function rellenarEspecialidades() {
  await mongoose.connect(MONGODB_URI);
  const mecanicos = await Usuario.find({ rol: 'mecanico', $or: [ { especialidad: { $in: [null, '', undefined, 'General'] } }, { especialidad: { $exists: false } } ] });
  for (const m of mecanicos) {
    await Usuario.findByIdAndUpdate(m._id, { especialidad: 'latonero' });
    console.log(`Actualizado: ${m.nombre} | Especialidad: latonero`);
  }
  // Validar que todos los mecánicos tengan especialidad válida
  const todos = await Usuario.find({}, 'nombre especialidad rol');
  todos.forEach(u => {
    if (u.rol === 'mecanico' && (!u.especialidad || u.especialidad === '' || u.especialidad === 'General')) {
      console.warn(`Mecánico sin especialidad válida: ${u.nombre}`);
    }
  });
  await mongoose.disconnect();
  console.log('Especialidades de mecánicos actualizadas a "latonero" y validación realizada.');
}

rellenarEspecialidades().catch(console.error);
