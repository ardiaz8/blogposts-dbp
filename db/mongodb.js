const mongoose = require('mongoose');

exports.connectToDB = () => {
  // Tomar cadena de conexión a la base de datos del archivo de configuración
  const DB = process.env.LOCAL_DATABASE;

  // Conectarse a la base de datos en MongoDB
  mongoose
    .connect(DB)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch(err => {
      console.log(`MongoDB error: ${err}`);
      process.exit(1); // Terminar aplicación con código de error
    });
};
