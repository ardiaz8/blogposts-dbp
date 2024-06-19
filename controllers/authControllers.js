const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Verificar que se proveyó tanto el email como la contraseña
    if (!email || !password) {
      req.flash('validationErrors', ['Please provide email and password']);
      req.flash('data', req.body);
      return res.redirect(303, '/users/login');
    }

    // Buscar el documento con el email provisto para verificar que
    // exista el usuario; además hay que especificar que se regrese
    // el campo password, porque por omisión no se hace con el find
    const user = await User.findOne({ email }).select('+password');

    // Verificar si no existe el usuario o si la contraseña es incorrecta
    // comparándola con la contraseña encriptada en la base de datos
    if (!user || !(await user.correctPassword(password))) {
      req.flash('validationErrors', ['Incorrect email or password']);
      req.flash('data', req.body);
      return res.redirect(303, '/users/login');
    }

    // AUTORIZACIÓN USANDO jsonwebtoken

    // Crear el token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Opciones de la cookie con el token que se guardará en el
    // navegador del cliente
    const cookieOptions = {
      // Expira en 90 días (expresado en milisegundos) a partir de la
      // fecha de creación
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
      ),
      // Para que no pueda ser leída por las personas, sino que sea
      // sólo enviada y recibida por el navegador
      httpOnly: true,
    };

    // Enviar la cookie al cliente (navegador) en el objeto de respuesta
    res.cookie('jwt', token, cookieOptions);

    // FIN DE AUTORIZACIÓN USANDO jsonwebtoken

    // Redirigir a la página principal
    res.redirect(303, '/');
  } catch (err) {
    let validationErrors;
    if (err.code === 11000) {
      validationErrors = ['The provided email has already been registered'];
    } else {
      // Obtener una arreglo con los mensajes de error generados
      validationErrors = Object.values(err.errors).map(err => err.message);
    }

    // Guardar el arreglo en memoria flash
    req.flash('validationErrors', validationErrors);
    // Guardar cuerpo que contiene título y contenido en la memoria flash
    req.flash('data', req.body);
    // Redirigir a la ruta que llama a la función que muestra
    // la página de Register
    return res.redirect(303, '/users/login');
  }
};

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;
    // console.log(req.body);
    // Crear el nuevo documento
    const newUser = await User.create({
      name,
      email,
      password,
      passwordConfirm,
    });

    // AUTORIZACIÓN USANDO jsonwebtoken

    // Crear el token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Opciones de la cookie con el token que se guardará en el
    // navegador del cliente
    const cookieOptions = {
      // Expira en 90 días (expresado en milisegundos) a partir de la
      // fecha de creación
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
      ),
      // Para que no pueda ser leída por las personas, sino que sea
      // sólo enviada y recibida por el navegador
      httpOnly: true,
    };

    // Enviar la cookie al cliente (navegador) en el objeto de respuesta
    res.cookie('jwt', token, cookieOptions);

    // FIN DE AUTORIZACIÓN USANDO jsonwebtoken

    // Redirigir a la página principal
    res.redirect(303, '/');
  } catch (err) {
    let validationErrors;
    if (err.code === 11000) {
      validationErrors = ['The provided email has already been registered'];
    } else {
      // Obtener una arreglo con los mensajes de error generados
      validationErrors = Object.values(err.errors).map(err => err.message);
    }

    // Guardar el arreglo en memoria flash
    req.flash('validationErrors', validationErrors);
    // Guardar cuerpo que contiene título y contenido en la memoria flash
    req.flash('data', req.body);
    // Redirigir a la ruta que llama a la función que muestra
    // la página de Register
    return res.redirect(303, '/users/new');
  }
};

exports.signout = (req, res, next) => {
  // Opciones de la cookie
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  };

  // Invalidar la cookie que contiene al token jwt
  res.cookie('jwt', 'loggedout', cookieOptions);

  // Redirigir a la página de inicio de sesión
  return res.redirect(303, '/users/login');
};

// Función de middleware para autorizar el acceso a recursos
exports.protect = async (req, res, next) => {
  try {
    // 1) Intentar obtener el token para verificar que exista
    const token = req.cookies.jwt;

    if (!token) {
      // Redirigir a la página de inicio de sesión
      return res.redirect(303, '/users/login');
    }

    // 2) Verificar la validez del token (si no es válido se lanza un error)
    //    y obtener el "payload" del token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    // 3) Verificar si el usuario no existe
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      // Redirigir a la página de inicio de sesión
      return res.redirect(303, '/users/login');
    }

    // Actualizar el usuario en el objeto req para opcionalmente
    // pasarlo al siguiente elemento de middleware
    req.user = currentUser;

    // Autorizar acceso a la ruta protegida
    next();
  } catch (err) {
    // Redirigir a la página de inicio de sesión
    return res.redirect(303, '/users/login');
  }
};

// Función de middleware para determinar si el usuario inició sesión,
// en cuyo caso se guardará en el objeto de la respuesta (res) la
// referencia del objeto del usuario
exports.isLoggedIn = async (req, res, next) => {
  try {
    // Asumir que no hay usuario ingresado en la sesión
    res.locals.user = undefined;

    // 1) Intentar obtener el token para verificar que exista
    const token = req.cookies.jwt;

    if (!token) {
      // Ejecutar el siguiente elemento de middleware
      return next();
    }

    // 2) Verificar la validez del token (si no es válido se lanza un error)
    //    y obtener el "payload" del token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    // 3) Verificar si el usuario no existe
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      // Ejecutar el siguiente elemento de middleware
      return next();
    }

    // Actualizar el usuario en el objeto req para opcionalmente
    // pasarlo al siguiente elemento de middleware
    req.user = currentUser;

    // Actualizar variable en locals con la referencia del usuario
    // para poder ser utilizada por las páginas EJS
    res.locals.user = currentUser;

    // Ejecutar el siguiente elemento de middleware
    next();
  } catch (err) {
    // Ejecutar el siguiente elemento de middleware
    return next();
  }
};
