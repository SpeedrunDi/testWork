require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const exitHook = require('async-exit-hook');

const {mongo} = require('./config');
const users = require('./app/users')

const PORT = 8000;

const app = express();

app.use(express.json());
app.use('/users', users);

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

run().catch(e => console.error(e))