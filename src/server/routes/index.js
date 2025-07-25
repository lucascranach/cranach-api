const express = require('express');
const passport = require('passport');

const controller = require('../controllers');
const { Mappings, MappingType } = require('../mappings');
const queryParamsParser = require('../query-params-parser');

const promClient = require('../utils/promClient');

const routes = express.Router();

const genericMappings = new Mappings(MappingType.GENERIC);
const worksMappings = new Mappings(MappingType.WORKS);
const archivalsMappings = new Mappings(MappingType.ARCHIVALS);
const literatureMappings = new Mappings(MappingType.LITERATURE);
const drawingsMappings = new Mappings(MappingType.DRAWINGS);

// This endpoint must be accessible at /api/metrics because Prometheus directly scrapes the target
// using the full path (e.g., http://cranach-api:8080/api/metrics). Even though NGINX may rewrite
// URLs externally, Prometheus bypasses the reverse proxy and contacts the
// service container directly, so the exact route must be defined in the Node.js app itself.
routes.get(['/metrics'], async (req, res) => {
  try {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  } catch (ex) {
    res.status(500).end(ex.message);
  }
});

routes.route(['/', '/geodata']).get(
  passport.authenticate('basic', { session: false }),
  queryParamsParser.validateParams(genericMappings),
  controller.getItems(genericMappings),
);
routes.route(['/works', '/works/geodata']).get(
  passport.authenticate('basic', { session: false }),
  queryParamsParser.validateParams(worksMappings),
  controller.getItems(worksMappings),
);
routes.route(['/archivals', '/archivals/geodata']).get(
  passport.authenticate('basic', { session: false }),
  queryParamsParser.validateParams(archivalsMappings),
  controller.getItems(archivalsMappings),
);
routes.route(['/literature_references', '/literature_references/geodata']).get(
  passport.authenticate('basic', { session: false }),
  queryParamsParser.validateParams(literatureMappings),
  controller.getItems(literatureMappings),
);

routes.route(['/drawings', '/drawings/geodata']).get(
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
