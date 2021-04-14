const express = require('express');
const controller = require('../controllers');

const routes = express.Router();

routes.route('/').get(passport.authenticate('basic', { session: false }), controller.getItems);
routes.route('/:id').get(passport.authenticate('basic', { session: false }), controller.getSingleItem);

module.exports = routes;
