// const Blog = require('../Models/blogModel');

// const author = async (req, res, next) => {
//     try {
//         const blogId = req.params.id;
//         const userId = req.user;       

//         if (!blogId) {
//             return res.status(400).json({ msg: 'Blog ID is required' });
//         }

//         const blog = await Blog.findById(blogId);

//         if (!blog) {
//             return res.status(404).json({ msg: 'Blog post not found' });
//         }

//         if (blog.author.toString() !== userId) {
//             return res.status(403).json({ msg: 'Access denied: You are not the author of this post' });
//         }

//         req.blog = blog;
//         next();
//     } catch (err) {
//         console.error("Author middleware error:", err);
//         if (err.kind === 'ObjectId') {
//              return res.status(404).json({ msg: 'Blog not found' });
//         }
//         res.status(500).send('Server Error in author check');
//     }
// };

// module.exports = author;

const Blog = require('../Models/blogModel');

const author = async (req, res, next) => {
    try {
        const blogId = req.params.id;
        const userId = req.user;

        console.log('Author Middleware - Blog ID:', blogId);
        console.log('Author Middleware - User ID:', userId);
        console.log('Author Middleware - req.user:', req.user);

        if (!blogId) {
            return res.status(400).json({ msg: 'Blog ID is required' });
        }

        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({ msg: 'Blog post not found' });
        }

        console.log('Author Middleware - Blog Author:', blog.author);
        console.log('Author Middleware - Blog Author toString:', blog.author.toString());
        console.log('Author Middleware - Comparison:', blog.author.toString() === userId);

        if (blog.author.toString() !== userId) {
            console.log('Author Middleware - ACCESS DENIED');
            return res.status(403).json({ msg: 'Access denied: You are not the author of this post' });
        }

        req.blog = blog;
        console.log('Author Middleware - ACCESS GRANTED');
        next();
    } catch (err) {
        console.error("Author middleware error:", err);
        if (err.kind === 'ObjectId') {
             return res.status(404).json({ msg: 'Blog not found' });
        }
        res.status(500).send('Server Error in author check');
    }
};

module.exports = author;