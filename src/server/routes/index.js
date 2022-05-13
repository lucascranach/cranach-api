const express = require('express');
const passport = require('passport');

const controller = require('../controllers');

const routes = express.Router();

routes.route('/').get(passport.authenticate(['basic', 'jwt'], { session: false }), controller.getItems);
routes.route('/:id').get(passport.authenticate(['basic', 'jwt'], { session: false }), controller.getSingleItem);

module.exports = routes;
