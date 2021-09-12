const { User, validateUser } = require("../models/userModel");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const admin = require('../middleware/admin');
const express = require("express");
const router = express.Router();

// const { models } = require("mongoose");
// All users
router.get('/', async(req,res)=>{
  try{
    const users = await User.find();

    return res
    .send(users);
  } catch(ex){
    return res.status(500).send(`Internal Server Error:${ex}`);
  }
})
//Get User by ID
router.get('/:userId', async(req,res)=>{
  try{
    const users = await User.findById(req.params.userId);
    if (!users) return res.status(400).send(`The user with id "${req.params.userId}" does not exist.`);

    return res
    .send(users);
  } catch(ex){
    return res.status(500).send(`Internal Server Error:${ex}`);
  }
})

// creating new user
router.post("/", async (req, res) => {
  try {
    let user = await User.findOne({email: req.body.email});
    if (user) return res.status(400).send(error);

    const salt = await bcrypt.genSalt(10);
    user = new User({
      userName: req.body.userName,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, salt),
    });
    await user.save();
    const token = user.generateAuthToken();

    return res
      .header('x-auth-token', token)
      .header('access-control-expose-headers', 'x-auth-token')
      .send(user);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

router.put("/:userId", auth, async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error);
    
    const salt = await bcrypt.genSalt(10);
    let user = await User.findByIdAndUpdate(req.params.userId,{
      userName : req.body.userName,
      email : req.body.email,
      password : await bcrypt.hash(req.body.password, salt),},
      {new: true}
      );
    if (!user)
      return res
        .status(400)
        .send(`The user with id "${req.params.userId}" does not exist.`);

    await user.save();
    const token = user.generateAuthToken();

    return res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send({ _id: user._id, userName: user.userName, email: user.email, isAdmin: this.isAdmin });

  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//Delete User by ID
router.delete('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndRemove(req.params.userId);
    if (!user)
      return res.status(400).send(`The user with id "${req.params.userId}" does not exist.`);
    return res.send(user);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});
module.exports = router;
