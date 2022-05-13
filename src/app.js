const passport = require('passport');
const mongoose = require('mongoose');

const { BasicStrategy } = require('passport-http');

const elastic = require('./elastic');
const server = require('./server');

require('dotenv').config();

const UserModel = require('./server/jwt/models');

mongoose.connect(process.env.MONGO_DB_CONNECTION_STRING, {
  user: 'admin',
  pass: process.env.MONGO_DB_PASSWORD,
  authSource: 'admin',
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('error', (error) => console.log(error));

server.start();

passport.use(new BasicStrategy(
  ((username, password, done) => {
    if (username.valueOf() === process.env.API_USERNAME
      && password.valueOf() === process.env.API_PASSWORD) {
      return done(null, true);
    }
    return done(null, false);
  }),
));
