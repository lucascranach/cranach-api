const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post(
  '/signup',
  passport.authenticate('basic', { session: false }),
  (req, res, next) => {
    next();
  },
);

router.post(
  '/signup',
  passport.authenticate('signup', { session: false }),
  async (req, res, next) => {
    res.json({
      message: 'Signup successful',
      user: req.user,
    });
  },
);

router.post(
  '/login',
  async (req, res, next) => {
    passport.authenticate(
      'login',
      async (err, user, info) => {
        try {
          if (err || !user) {
            const error = new Error('An error occurred.');

            return next(error);
          }

          req.login(
            user,
            { session: false },
            async (error) => {
              if (error) return next(error);

              // eslint-disable-next-line no-underscore-dangle
              const body = { _id: user._id, email: user.email };
              const token = jwt.sign(
                { user: body },
                process.env.JWT_SECRET,
                { expiresIn: process.env.SESSION_EXPIRY },
              );

              return res
              .cookie('jwt',
                token, {
                  httpOnly: true,
                  secure: process.env.HTTPS || false
                }
              )
              .end();
            },
          );
        } catch (error) {
          return next(error);
        }
      },
    )(req, res, next);
  },
);

module.exports = router;
