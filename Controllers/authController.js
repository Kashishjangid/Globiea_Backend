const User = require('../Models/authModel');

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    const missingFields = !username? 'username' : !email ? 'email' : !password ? 'password' : null;
    if (missingFields) {
        return res.status(400).json({ message: `Missing field: ${missingFields}` });
    }

    const existingUser = await User.findOne({email});
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hassedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        username,
        email,
        password: hassedPassword
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
}


const loginUser = async (req, res) => {
    const {email, password} = req.body;

    const missingFields = !email ? 'email' : !password ? 'password' : null;
    if (missingFields) {
        return res.status(400).json({ message: `Missing field: ${missingFields}` });
    }

    const user = await User.findOne({email});
    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid password' });
    }

    jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) {
            return res.status(500).json({ message: 'Error generating token' });
        }
        res.json({ token, user: { id: user.id, email , username: user.username } });
    });

}

module.exports = {
    registerUser,
    loginUser
};