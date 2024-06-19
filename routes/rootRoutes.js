const express = require('express');
const router = express.Router();
const rootControllers = require('../controllers/rootControllers');

/* GET home page. */
router.get('/', rootControllers.getRoot);

router.get('/about', rootControllers.getAbout);

router.get('/contact', rootControllers.getContact);

// router.get('/post', rootControllers.getPost);

module.exports = router;
