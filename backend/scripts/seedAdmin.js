const mongoose = require('mongoose');
require('dotenv').config();
const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  await mongoose.connect(MONGODB_URI);
  const correo = process.env.SEED_ADMIN_EMAIL || 'admin@local.test';
  const existing = await Usuario.findOne({ correo });
  if (existing) {
    console.log('Admin ya existe:', correo);
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const password = process.env.SEED_ADMIN_PASS || 'Admin123!';
  const hashed = await bcrypt.hash(password, salt);

  const admin = new Usuario({
    nombre: 'Administrador',
    correo,
    password: hashed,
    rol: 'admin',
    activo: true
  });

  await admin.save();
  console.log('Admin seed creado:', correo, 'con contraseña:', password);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
