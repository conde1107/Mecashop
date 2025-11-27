// Script para revisar el campo 'imagen' de los mecánicos en la base de datos
require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('./models/usuario');

const MONGODB_URI = process.env.MONGODB_URI;

async function revisarImagenesMecanicos() {
  await mongoose.connect(MONGODB_URI);
  const mecanicos = await Usuario.find({ rol: 'mecanico' }, 'nombre imagen correo');
  console.log('Mecánicos y sus imágenes:');
  mecanicos.forEach(m => {
    console.log(`Nombre: ${m.nombre} | Correo: ${m.correo} | Imagen: ${m.imagen}`);
  });
  await mongoose.disconnect();
}

revisarImagenesMecanicos().catch(console.error);
