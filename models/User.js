const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    minlength: [2, 'Name must have at least 2 characters'],
    maxlength: [100, 'Name must be at most 100 characters long'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    lowercase: true,
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must have at least 8 characters'],
    // No mostrar contraseña cuando se pida información del usuario
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    // Validar que la contraseña y su confirmación sean iguales
    validate: {
      validator: function (pass) {
        return pass === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
});

// Middleware para encriptar automáticamente la contraseña antes de
// guardarla
UserSchema.pre('save', async function (next) {
  // Verificar si no se modificó la contraseña para no encriptar de
  // nuevo a la contraseña ya encriptada
  if (!this.isModified('password')) {
    // No continuar con la encriptación invocando el siguiente
    // elemento de middleware
    return next();
  }

  // Encriptar la contraseña
  this.password = await bcrypt.hash(this.password, 12);

  // No guardar el campo de confirmación de contraseña
  this.passwordConfirm = undefined;

  // Continuar con el siguiente paso de la secuencia de middleware
  next();
});

// Método de instancia para comprobar que la contraseña encriptada
// sea correcta
UserSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Crear el modelo a partir del esquema
const User = mongoose.model('User', UserSchema);

// Exportar el modelo
module.exports = User;
