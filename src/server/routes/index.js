const express = require('express');
const passport = require('passport');

const controller = require('../controllers');
const { Mappings, MappingType } = require('../mappings');
const queryParamsParser = require('../query-params-parser');

const routes = express.Router();

const genericMappings = new Mappings(MappingType.GENERIC);
const worksMappings = new Mappings(MappingType.WORKS);
const archivalsMappings = new Mappings(MappingType.ARCHIVALS);

routes.route('/').get(
  passport.authenticate('basic', { session: false }),
  queryParamsParser.validateParams(genericMappings),
  controller.getItems(genericMappings),
);
routes.route('/works').get(
  passport.authenticate('basic', { session: false }),
  queryParamsParser.validateParams(worksMappings),
  controller.getItems(worksMappings),
);
routes.route('/archivals').get(
  passport.authenticate('basic', { session: false }),
  queryParamsParser.validateParams(archivalsMappings),
  controller.getItems(archivalsMappings),
);
routes.route('/:id').get(
  passport.authenticate('basic', { session: false }),
  controller.getSingleItem(worksMappings), // INFO: using works-mapping for all kinds of resources for now
);

module.exports = routes;
