const express = require('express');
const router = express.Router();
const postsControllers = require('../controllers/postsControllers');
const authControllers = require('../controllers/authControllers');

router.get('/id/:id', postsControllers.getPost);
router.get('/new', authControllers.protect, postsControllers.getNewPost);

router.post('/store', authControllers.protect, postsControllers.createPost);

module.exports = router;
