// Script para actualizar rutas de informes PDF a formato correcto
const mongoose = require('mongoose');
const Servicio = require('../models/servicio');
require('dotenv').config();

const fixInformePaths = async () => {
  try {
    console.log(' Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mecashop');
    console.log(' Conectado a MongoDB');

    // Buscar todos los servicios con informe
    const servicios = await Servicio.find({ informe: { $ne: null } });
    console.log(` Encontrados ${servicios.length} servicios con informe`);

    let actualizados = 0;

    for (const servicio of servicios) {
      // Si ya tiene el prefijo 'uploads/', no hacer nada
      if (servicio.informe.startsWith('uploads/')) {
        console.log(` ${servicio._id}: Ya tiene ruta correcta (${servicio.informe})`);
        continue;
      }

      // Si no tiene el prefijo, agregarlo
      const rutaAntigua = servicio.informe;
      const rutaNueva = `uploads/${rutaAntigua}`;

      await Servicio.findByIdAndUpdate(servicio._id, { informe: rutaNueva });
      console.log(` ${servicio._id}: ${rutaAntigua} → ${rutaNueva}`);
      actualizados++;
    }

    console.log(`\n Actualización completada: ${actualizados} servicios corregidos`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(' Error:', error);
    process.exit(1);
  }
};

fixInformePaths();
