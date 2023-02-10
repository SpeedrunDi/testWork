const express = require('express');

const router = express.Router();
const User = require("../models/User");
const {getToken} = require("../middleware/token");

const getLiveCookie = user => {
  const { username } = user
  const maxAge = 330 * 60 * 60
  return { token: getToken(username, maxAge), maxAge }
}

router.post('/', async (req, res) => {
  try {
    const { password, username } = req.body;

    if (!password && !username) {
      return res.status(400).send({error: 'Data not valid'});
    }

    const userData = { password, username };

    const user = new User(userData);

    const { token, maxAge } = getLiveCookie(user);

    res.cookie('jwt', token, {
      httpOnly: false,
      maxAge: maxAge * 1000,
    });

    user.token = token;

    await user.save();

    return res.send(user)
  } catch (e) {
    return res.status(400).send(e)
  }
})

module.exports = router