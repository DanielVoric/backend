const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router(); //inicijalizacija express rutera
const User = require('../models/User');



//middleware za verifikaciju JWT tokena
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

//ruta za registraciju korisnika
router.post('/register', async (req, res) => {
    try { //js proba runnat block, i hvata errore
        const { email, username } = req.body;

        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ message: 'Username or Email already exist.' });
        }

        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return res.status(400).json({ message: 'Username or Email already exist.' });
        }

        const user = new User(req.body);
        await user.save();
        res.status(201).json({ message: "Registration successful." });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


//prijava korisnika
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
            return res.status(400).json({ message: 'Wrong username or password.' });
        }

        const token = jwt.sign({ userId: user._id }, 'YOUR_SECRET_KEY', { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

//ne koristim
// registriranje middlewarea za specificnu rutu 
router.use('/some-protected-route', verifyToken);

// definiranje rute kuda prolazi verify token (middleware)
router.get('/some-protected-route', (req, res) => {
    res.send('This is a protected route.');
});

module.exports = {
    authRouter: router,
    verifyToken: verifyToken
};
