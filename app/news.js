const express = require('express');
const auth = require('../middleware/auth');
const New = require('../models/New');

const router = express.Router();

router.get('/',  async (req, res) => {
  try {
    const news = await New.find();
    return res.send(news);
  } catch (e) {
    return res.status(500).send(e);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const news = await New.findById(req.params.id);

    if (!news) {
      return res.status(404).send({ error: 'News not found!' });
    }

    return res.send(news);
  } catch (e) {
    return res.status(500).send(e);
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).send({error: 'Data not valid'});
    }

    const newsData = {
      title,
      description: description || null,
      user: req.user._id,
    };

    const news = new New(newsData);
    await news.save();

    return res.send(news);
  } catch (e) {
    return res.status(500).send(e);
  }
});

router.put('/:id', auth, async(req, res) => {
  try{
    const {title, description} = req.body;
    if (!title ) {
      return res.status(400).send({error: 'Data not valid!'});
    }

    const NewsData = {
      title,
      description: description || null,
    };

    const news = await New.findById(req.params.id);
    if(!news) {
      return res.status(404).send({error: 'News not found!'});
    }


    if (req.user._id.equals(news.user) || req.user?.role === 'admin') {
      const updateNews = await New.findByIdAndUpdate(req.params.id, NewsData, {new: true});

      return res.send(updateNews);
    }

    res.status(403).send({message: 'You have no rights!'});
  } catch(e) {
    res.status(500).send(e);
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const news = await New.findById(req.params.id);

    if (!news) {
      return res.status(404).send({ error: 'News not found!' });
    }

    if (req.user._id.equals(news.user) || req.user?.role === 'admin') {
      await New.deleteOne({_id: req.params.id});

      return res.send({message: 'News deleted!'});
    }

    res.status(403).send({error: 'You have no rights!'});
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
});

module.exports = router;