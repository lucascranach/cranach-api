const express = require('express');
const passport = require('passport');

const controller = require('../controllers');
const { Mappings, MappingType } = require('../mappings');
const queryParamsParser = require('../query-params-parser');

const routes = express.Router();

const genericMappings = new Mappings(MappingType.GENERIC);
const worksMappings = new Mappings(MappingType.WORKS);
const archivalsMappings = new Mappings(MappingType.ARCHIVALS);
const literatureMappings = new Mappings(MappingType.LITERATURE);
const drawingsMappings = new Mappings(MappingType.DRAWINGS);

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

routes.route('/literature_references').get(
  passport.authenticate('basic', { session: false }),
  queryParamsParser.validateParams(literatureMappings),
  controller.getItems(literatureMappings),
);

routes.route('/drawings').get(
  passport.authenticate('basic', { session: false }),
  queryParamsParser.validateParams(drawingsMappings),
  controller.getItems(drawingsMappings),
);

routes.route('/:id').get(
  passport.authenticate('basic', { session: false }),
  // INFO: using works-mapping for all kinds of resources for now
  controller.getSingleItem(worksMappings),
);

module.exports = routes;
