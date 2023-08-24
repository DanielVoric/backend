const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        jwt.verify(bearerToken, 'YOUR_SECRET_KEY', (err, authData) => {
            if (err) {
                res.sendStatus(403); 
            } else {
                req.userId = authData.userId;
                next();
            }
        });
    } else {
        res.sendStatus(403);
    }
};

router.post('/register', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user._id }, 'YOUR_SECRET_KEY', { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// registriranje middlewarea za specificnu rutu 
router.use('/some-protected-route', verifyToken);

// definiranje rute kuda prolazi verify token (middleware)
router.get('/some-protected-route', (req, res) => {
    res.send('This is a protected route.');
});

module.exports = router;
