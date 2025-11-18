const express = require('express');
const router = express.Router();
const { allBlogs, myBlogs, createBlog, editBlog, deleteBlog, getBlogById  } = require('../Controllers/blogController');
const auth = require('../Middleware/authMiddleware');
const upload = require('../Middleware/blogImageMiddleware');
const author = require('../Middleware/authorMiddleware');

router.get('/', allBlogs);
router.post('/create', auth, upload.single('blogImage'), createBlog);
router.get('/my', auth, myBlogs);
router.put('/:id', auth, author, upload.single('blogImage'), editBlog);
// router.delete('/:id', auth, author, deleteBlog);
// router.delete('/:id', deleteBlog);

router.delete('/:id', (req, res, next) => {
  req.body = {};
  next();
}, auth, author, deleteBlog);

router.get('/:id', getBlogById);

module.exports = router;