const createError = require('http-errors');
const BlogPost = require('../models/BlogPost');

exports.getPost = async (req, res, next) => {
  try {
    // Obtener el id
    const id = req.params.id;
    // console.log(id);
    // Buscar posteo con el id dado y reemplazando el userId con
    // el documento del usuario asociado a ese userId
    const blogPost = await BlogPost.findById(id, { __v: 0 }).populate({
      path: 'userId',
    });
    console.log(blogPost);
    if (!blogPost) {
      // Regresar la respuesta de recurso no encontrado
      //return res.status(404).json({ message: 'Página no encontrada' });
      return next(createError(404, 'Page not found'));
    }

    // Incrementar el contador de vistas del objeto
    blogPost.views++;

    // Actualizar número de vistas en el documento de la BD
    await BlogPost.findByIdAndUpdate(id, { $inc: { views: 1 } });

    //await BlogPost.findOneAndUpdate({ _id: id }, { $inc: { views: 1 } });

    // Determinar si no se encontró el posteo
    //res.json(blogPost);
    res.render('post', { blogPost });
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

exports.getNewPost = (req, res, next) => {
  let title;
  let content;

  // Obtener la información de la memoria flash del cuerpo de la petición
  const data = req.flash('data')[0];

  // Verificar que haya datos
  if (data) {
    title = data.title;
    content = data.content;
  }

  // Obtener información de la memoria flash
  const validationErrors = req.flash('validationErrors');
  res.render('create', {
    // Pasar arreglo de mensajes de error a la página web
    validationErrors,
    title,
    content,
    createPost: true,
  });
};

exports.createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    // El autor posteriomente será el usuario que está usando el sistema
    // Por el momento se pondrá un autor fijo por código
    // const author = 'John Wick';

    // Obtener el identificador del usuario a partir de la información
    // del mismo guardada por la función protect en el objeto de la
    // petición (req)
    const userId = req.user._id;

    // Crear el nuevo documento
    const newPost = await BlogPost.create({
      title,
      content,
      //author,
      userId,
      views: 1, // Se mostrará al final la página del posteo
    });

    if (!newPost) {
      // Regresar la respuesta de recurso no encontrado
      return next(createError(400, 'Document not created'));
    }

    // Mostrar la página con el posteo recién creado
    // res.render('post', { blogPost: newPost });

    // Redirigir a la página que presenta el posteo recién creado
    res.redirect(303, `/posts/id/${newPost._id}`);
  } catch (err) {
    //console.log(err);
    //return next(err);
    // Obtener una arreglo con los mensajes de error generados
    const validationErrors = Object.values(err.errors).map(err => err.message);
    // console.log(validationErrors);
    // Guardar el arreglo en memoria flash
    req.flash('validationErrors', validationErrors);
    // Guardar cuerpo que contiene título y contenido en la memoria flash
    req.flash('data', req.body);
    // Redirigir a la ruta que llama a la función que muestra
    // la página de New Post
    res.redirect(303, '/posts/new');
  }
};
