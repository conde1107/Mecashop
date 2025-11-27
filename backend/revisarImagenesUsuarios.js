// Script para revisar el campo 'imagen' de los usuarios en la base de datos
require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('./models/usuario');

const MONGODB_URI = process.env.MONGODB_URI;

async function revisarImagenesUsuarios() {
  await mongoose.connect(MONGODB_URI);
  const usuarios = await Usuario.find({}, 'nombre correo rol imagen');
  console.log('Usuarios y sus imágenes:');
  usuarios.forEach(u => {
    console.log(`Nombre: ${u.nombre} | Correo: ${u.correo} | Rol: ${u.rol} | Imagen: ${u.imagen}`);
  });
  await mongoose.disconnect();
}

revisarImagenesUsuarios().catch(console.error);
