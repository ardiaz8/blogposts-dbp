const express = require('express');
const router = express.Router();
const usersControllers = require('../controllers/usersControllers');
const authControllers = require('../controllers/authControllers');

router.get('/login', usersControllers.getLogInUser);
router.get('/new', usersControllers.getNewUser);

router.post('/signup', authControllers.signup);
router.post('/signin', authControllers.signin);
router.get('/logout', authControllers.protect, authControllers.signout);

module.exports = router;
