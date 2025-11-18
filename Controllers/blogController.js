const author = require('../Middleware/authorMiddleware');
const Blog = require('../Models/blogModel');
const path = require('path');
const fs = require('fs');

const express = require('express');

const allBlogs = async (req, res) => {
    const blogs = await Blog.find().sort({ createdAt: -1 }).populate('author', 'email username');
    res.json(blogs);
};

const createBlog = async (req, res) => {
  const { title, content } = req.body;
  const imageUrlPath = req.file ? `/uploads/${req.file.filename}` : null;

  // console.log("Blog Data Received:", { title, content, authorId: req.user, imageUrlPath });

  if (!req.user) {
    return res.status(401).send('Authentication Error: Missing User ID after decoding.');
  }

  try {
    const newBlog = new Blog({
      title,
      content,
      blogImage: imageUrlPath, 
      author: req.user, 
    });
    
    const blog = await newBlog.save();

    await blog.populate('author', 'email username');
    res.json(blog);
  } catch (err) {
      console.error("FATAL ERROR during Blog creation/save:", err.message, err); 
      res.status(500).send('Server Error: ' + err.message); // Send a specific error back
  }
};


// GET /api/blogs/my (Only current user's blogs)
const myBlogs = async (req, res) => {
    // console.log("My Blogs Controller - req.user:");
    try {
        // req.user is the authenticated user's ID string
        console.log("Fetching blogs for user ID:", req.user);
        const blogs = await Blog.find({ author: req.user }).sort({ createdAt: -1 }).populate('author', 'email username');
        console.log(blogs);
        res.json(blogs);
    } catch (err) {
        res.status(500).send('Server Error fetching user blogs');
    }
};


const editBlog = async (req, res) => {
    // req.blog is available from the 'author' middleware
    console.log('Edit Blog Controller - req.blog:', req.blog);
    const blog = req.blog;
    const { title, content } = req.body;
    const newFile = req.file;
    console.log('Edit Blog Controller - New File:', newFile);   

    try {
        if (title) blog.title = title;
        if (content) blog.content = content;

        if (newFile) {
            if (blog.blogImage) {
                const oldImagePath = path.join(__dirname, '..', blog.blogImage);
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error("Could not delete old image:", err);
                });
            }
            blog.blogImage = `/uploads/${newFile.filename}`;
        }

        await blog.save();
        await blog.populate('author', 'email username');
        res.json(blog);
    } catch (err) {
        console.error("FATAL ERROR during Blog update:", err.message, err); 
        res.status(500).send('Server Error updating blog: ' + err.message);
    }
};

// DELETE /api/blogs/:id (Delete a blog)
const deleteBlog = async (req, res) => {
    const blog = req.blog; 

    console.log('Delete Controller - Blog:', blog);
    console.log('Delete Controller - Blog ID:', blog._id);
    console.log('Delete Controller - User ID:', req.user);

    try {
        // if (blog.blogImage) {
        //     const imagePath = path.join(__dirname, '..', blog.blogImage);
        //     console.log('Delete Controller - Deleting image:', imagePath);
            
        //     fs.unlink(imagePath, (err) => {
        //         if (err) {
        //             console.error("Could not delete associated image file:", err);
        //         } else {
        //             console.log("Image file deleted successfully");
        //         }
        //     });
        // }
        
        console.log('Delete Controller - Deleting blog from database...');
        const result = await Blog.deleteOne({ _id: blog._id });
        console.log('Delete Controller - Delete result:', result);
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ msg: 'Blog not found in database' });
        }
        
        res.json({ msg: 'Blog removed successfully' });
    } catch (err) {
        console.error("FATAL ERROR during Blog deletion:", err.message, err); 
        res.status(500).send('Server Error deleting blog: ' + err.message);
    }
};


const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', 'email username');
        
        if (!blog) {
            return res.status(404).json({ msg: 'Blog not found' });
        }

        res.json(blog);
    } catch (err) {
        console.error("Error fetching blog:", err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Blog not found' });
        }
        res.status(500).send('Server Error fetching blog');
    }
};

module.exports = {
    allBlogs,
    createBlog,
    myBlogs,
    editBlog,
    deleteBlog,
    getBlogById
};