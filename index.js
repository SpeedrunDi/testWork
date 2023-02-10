require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const exitHook = require('async-exit-hook');

const {mongo} = require('./config');
const users = require('./app/users')
const news = require('./app/news');

const PORT = 8000;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/users', users);
app.use('/news', news);

const run = async () => {
  mongoose.set('strictQuery', false);
  await mongoose.connect(mongo.db, mongo.options);

  console.log('Mongo connected');
  app.listen(PORT, () => {
    console.log(`Server started on ${PORT} port!`);
  });

  exitHook(() => {
    mongoose.disconnect();
    console.log('MongoDb disconnect');
  });
};

run().catch(e => console.error(e));