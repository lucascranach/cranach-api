const passport = require('passport');
const { BasicStrategy } = require('passport-http');

const elastic = require('./elastic');
const server = require('./server');
require('dotenv').config();

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
