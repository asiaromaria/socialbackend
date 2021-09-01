const { User, validateUser, userSchema } = require('../models/userModel');
const express = require('express');
const router = express.Router();

const bcrypt = require("bcrypt")
// const { models } = require("mongoose");


router.post('/', async (req, res) => {
try {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already registered.');
    const salt = await bcrypt.genSalt(10);
    user = new User({
    name: req.body.name,
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, salt),
    });
    await user.save();
    return res.send({ _id: user._id, name: user.name, email: user.email });
    } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});



module.exports = router;