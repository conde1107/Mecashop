const mongoose = require('mongoose');
require('dotenv').config();

async function checkPaths() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mecashop');
    
    const servicios = await mongoose.connection.collection('servicios').find({ informe: { $ne: null } }).limit(5).toArray();
    
    console.log('Ejemplos de rutas guardadas:');
    servicios.forEach(s => {
      console.log(`- ${s.informe}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkPaths();
