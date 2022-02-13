const express = require('express');
const mongoose = require('mongoose');
const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
} = require('./config/config');

const app = express();

// db connection
const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
  mongoose
    .connect(mongoURL)
    .then(() => {
      console.log('Successfully connected to DB');
    })
    .catch(err => {
      console.log(err), setTimeout(connectWithRetry, 5000);
    });

  // test route
  app.get('/', (req, res) => {
    res.send('<h2>Hi there</h2>');
  });
};

connectWithRetry();

// open a port and listen for connection
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
