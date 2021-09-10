const { User, validateUser } = require("../models/userModel");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    return res.send(users);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});
router.post("/", async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User already registered.");
    const salt = await bcrypt.genSalt(10);
    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, salt),
      isAdmin: req.body.isAdmin,
    });
    await user.save();
    const token = user.generateAuthToken();
    return res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send({ _id: user._id, name: user.name, email: user.email });
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});
router.post("/:userId/friends/:friendId", auth, async (req, res) => {
  try {
    //We then  take both  of  the  id’s  and  query  the  respective  collection to
    //ensure  that  those  id’ s are  valid  and  belong to  existing  documents in  their  collection.
    const user = await User.findById(req.params.userId);
    if (!user)
      return res
        .status(400)
        .send(`The user with id "${req.params.userId}" does not exist.`);
    const friend = await friend.findById(req.params.friendId);
    if (!friend)
      return res
        .status(400)
        .send(`The friend with id "${req.params.friendId}" does not exist. `);
    user.friends.push(friend);
    await user.save();
    return res.send(user.friends);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});
router.put("/:userId/friends/:friendId", auth, async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error);
    const user = await User.findById(req.params.userId);
    if (!user)
      return res
        .status(400)
        .send(
          `The user with id "${req.params.friendId}" does not exist in the users shopping cart.`
        );
    const friend = user.friends.id(req.params.friendId);
    if (!friend)
      return res
        .status(400)
        .send(
          `The friend with id "${req.params.friendId}" does not in the users shopping cart.`
        );
    friend.name = req.body.name;
    await user.save();
    return res.send(friend);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});
router.delete("/:userId/friends/:friendId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user)
      return res
        .status(400)
        .send(`The user with id "${req.params.userId}" does not exist.`);
    let friend = user.friends.id(req.params.friendId);
    if (!friend)
      return res
        .status(400)
        .send(
          `The friend with id "${req.params.friendId}" does not exist.`
        );
    friend = await friend.remove();
    await user.save();
    return res.send(friend);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});
router.delete("/", async (req, res) => {
  try {
    const user = await User.findByIdAndRemove(req.params.id);
    if (!user)
      return res
        .status(400)
        .send(`The user with id "${req.params.id}" does not exist.`);
    return res.send(user);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});
module.exports = router;
