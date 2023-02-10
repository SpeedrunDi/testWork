const express = require('express');

const router = express.Router();
const User = require("../models/User");
const {getToken} = require("../middleware/token");
const auth = require("../middleware/auth");

const getLiveCookie = user => {
  const { username } = user
  const maxAge = 330 * 60 * 60
  return { token: getToken(username, maxAge), maxAge }
}

router.get('/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send({error: 'User not found!'});
    }

    return res.send(user);
  } catch {
    return res.status(500);
  }
});

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

    return res.send(user);
  } catch (e) {
    return res.status(500).send(e);
  }
});

router.post('/sessions', async (req, res) => {
  try {
    if (!req.body.username || !req.body.password) {
      return res.status(401).send({error: 'Введенные данные не верны!'});
    }

    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(401).send({error: 'Введенные данные не верны!'});
    }

    const isMatch = await user.checkPassword(req.body.password)
    if (!isMatch) {
      return res.status(401).send({error: 'Введенные данные не верны!'});
    }

    const { token, maxAge } = getLiveCookie(user);

    res.cookie('jwt', token, {
      httpOnly: false,
      maxAge: maxAge * 1000,
    });

    user.token = token;
    await user.save({ validateBeforeSave: false });

    return res.send(user);
  } catch (e) {
    return res.status(500).send(e);
  }
})

router.put('/edit', auth, async (req, res) => {
  try {
    const username = req.body.username

    if (!username) {
      return res.status(400).send({error: 'Data not valid!'});
    }

    const user = await User.findByIdAndUpdate(req.user._id, {username}, { new: true })

    return res.send(user)
  } catch (e) {
    return res.status(500).send(e)
  }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).send({error: 'You have no rights!'});
    }

    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ error: 'User not found!' });
    }

    if (user._id.equals(req.user._id)) {
      return res.status(400).send({ error: 'You cannot remove yourself' });
    }

    await User.deleteOne({ _id: userId });

    return res.send({ message: 'User deleted' });
  } catch {
    return res.sendStatus(500);
  }
});

module.exports = router;