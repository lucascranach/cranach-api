const express = require('express');
const controller = require('../controllers');

const routes = express.Router();

routes.route('/').get(controller.getGraphics);
routes.route('/:id').get(controller.getSingleGraphic);

module.exports = routes;
