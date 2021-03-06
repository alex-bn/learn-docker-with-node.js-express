const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const redis = require('redis');
let RedisStore = require('connect-redis')(session);

const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  SESSION_SECRET,
  REDIS_URL,
  REDIS_PORT,
} = require('./config/config');

let redisClient = redis.createClient({
  host: REDIS_URL,
  port: REDIS_PORT,
});

const postRouter = require('./routes/postRoutes');
const userRouter = require('./routes/userRoutes');
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
};
connectWithRetry();

//
app.enable('trust proxy');

// NOT WORKING!!! Error: Cannot find module 'cors'
const corsOptions = {
  origin: '*',
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    cookie: {
      secure: false,
      resave: false,
      saveUninitialized: false,
      httpOnly: true,
      maxAge: 30000,
    },
  })
);

// parse json middleware
app.use(express.json());

// test route
app.get('/api/v1', (req, res) => {
  res.send('<h2> ..just a dummy test Route.. </h2>');
  console.log('test');
});

// mMOUNT ROUTERS
// localhost:3000/api/v1/posts
app.use('/api/v1/posts', postRouter);
// localhost:3000/api/v1/users
app.use('/api/v1/users', userRouter);

// open a port and listen for connection
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
