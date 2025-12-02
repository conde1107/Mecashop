// Script para limpiar rutas de PDFs que contienen /informes/
const mongoose = require('mongoose');
require('dotenv').config();

async function cleanPaths() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mecashop');
    
    // Actualizar cualquier ruta que contenga /informes/
    const result = await mongoose.connection.collection('servicios').updateMany(
      { informe: { $regex: '/informes/' } },
      [{ $set: { informe: { $replaceAll: { input: '$informe', find: '/informes', replacement: '' } } } }]
    );
    
    console.log(` Actualizado: ${result.modifiedCount} servicios`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

cleanPaths();
