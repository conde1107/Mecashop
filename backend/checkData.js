const mongoose = require('mongoose');
const Solicitud = require('./models/solicitud');
const Servicio = require('./models/servicio');

mongoose.connect('mongodb://localhost:27017/mecashop').then(async () => {
  try {
    // Ver todas las solicitudes
    const solicitudes = await Solicitud.find().limit(5);
    console.log('\n=== SOLICITUDES ===');
    console.log('Total:', solicitudes.length);
    solicitudes.forEach(s => {
      console.log(`ID: ${s._id}`);
      console.log(`  vehiculoId: ${s.vehiculoId}`);
      console.log(`  clienteId: ${s.clienteId}`);
      console.log(`  estado: ${s.estado}`);
    });

    // Ver todos los servicios
    const servicios = await Servicio.find().limit(5);
    console.log('\n=== SERVICIOS ===');
    console.log('Total:', servicios.length);
    servicios.forEach(s => {
      console.log(`ID: ${s._id}`);
      console.log(`  solicitudId: ${s.solicitudId}`);
      console.log(`  clienteId: ${s.clienteId}`);
      console.log(`  mecanicoId: ${s.mecanicoId}`);
      console.log(`  informe: ${s.informe}`);
    });

    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
    mongoose.connection.close();
  }
}).catch(err => console.error('Connection error:', err));
