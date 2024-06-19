const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogPostSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please provide a post title'],
    minlength: [3, 'Title must have at least 3 characters'],
    maxlength: [100, 'Title must be at most 100 characters'],
    trim: true, // Quitar posibles espacios en blanco antes y después
  },
  content: {
    type: String,
    required: [true, 'Please provide some content'],
    minlength: [10, 'Content must have at least 10 characters'],
    maxlength: [20000, 'Content must be at most 20000 characters'],
    trim: true, // Quitar posibles espacios en blanco antes y después
  },
  // Identificador del usuario (del modelo User) que inició sesión y
  // que está creando el posteo
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  views: {
    type: Number,
    default: 0,
  },
});

// Modelo para los posteos
const BlogPost = mongoose.model('BlogPost', blogPostSchema);

// Exportar el modelo
module.exports = BlogPost;
