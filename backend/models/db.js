// db.js

const mongoose = require('mongoose');

const uri = "mongodb+srv://<usuario>:<password>@cluster0.xxxxx.mongodb.net/tienda";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Conectado a MongoDB Atlas"))
.catch(err => console.error("❌ Error al conectar a MongoDB:", err));

module.exports = mongoose;
