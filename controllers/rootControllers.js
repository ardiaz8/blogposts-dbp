const BlogPost = require('../models/BlogPost');

exports.getRoot = async (req, res, next) => {
  try {
    const blogPosts = await BlogPost.find({}, { __v: 0 }).populate({
      path: 'userId',
    });
    // console.log(blogPosts);
    res.render('index', { blogPosts }); // Llamadas a index.ejs
  } catch (err) {
    console.log(err);
  }
};

exports.getAbout = (req, res, next) => {
  res.render('about');
};

exports.getContact = (req, res, next) => {
  res.render('contact');
};

exports.getPost = (req, res, next) => {
  res.render('post');
};
