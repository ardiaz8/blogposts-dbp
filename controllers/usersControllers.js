exports.getLogInUser = (req, res, next) => {
  let email;
  const data = req.flash('data')[0];

  if (data) {
    email = data.email;
  }
  const validationErrors = req.flash('validationErrors');

  res.render('login', {
    validationErrors,
    email,
  });
};

exports.getNewUser = (req, res, next) => {
  let name;
  let email;
  const data = req.flash('data')[0];

  if (data) {
    name = data.name;
    email = data.email;
  }
  const validationErrors = req.flash('validationErrors');

  res.render('register', {
    validationErrors,
    name,
    email,
  });
};
