const express = require('express');
const controller = require('../controllers');

const routes = express.Router();

routes.route('/').get(controller.getItems);
routes.route('/:id').get(controller.getSingleItem);

module.exports = routes;
