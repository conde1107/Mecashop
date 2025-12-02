// Script para limpiar referencias de informes que no existen
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Servicio = require('../models/servicio');
require('dotenv').config();

const cleanMissingInformes = async () => {
  try {
    console.log(' Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mecashop');
    console.log('Conectado a MongoDB');

    // Buscar todos los servicios con informe
    const servicios = await Servicio.find({ informe: { $ne: null } });
    console.log(` Encontrados ${servicios.length} servicios con informe`);

    let eliminados = 0;
    let mantenidos = 0;

    for (const servicio of servicios) {
      // Construir la ruta real del archivo
      const rutaArchivo = path.join(__dirname, '..', servicio.informe);
      
      // Verificar si el archivo existe
      if (!fs.existsSync(rutaArchivo)) {
        console.log(`❌ ${servicio._id}: Archivo no existe (${servicio.informe})`);
        
        // Eliminar la referencia del informe
        await Servicio.findByIdAndUpdate(servicio._id, { informe: null });
        console.log(`    Informe eliminado de la BD`);
        eliminados++;
      } else {
        console.log(` ${servicio._id}: Archivo existe (${servicio.informe})`);
        mantenidos++;
      }
    }

    console.log(`\n Limpieza completada:`);
    console.log(`   - Informes eliminados: ${eliminados}`);
    console.log(`   - Informes mantenidos: ${mantenidos}`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(' Error:', error);
    process.exit(1);
  }
};

cleanMissingInformes();
