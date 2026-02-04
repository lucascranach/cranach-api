const model = require('../models');
const Aggregator = require('../es-engine/aggregator');

function getSingleItem(mappings) {
  return async (req, res) => {
    const { id } = req.params;
    if (!id) {
      res.status(422).json({
        error: true,
        data: 'Missing required path parameter: id',
      });
      return;
    }
    const params = {
      id,
      language: req.query.language,
      showDataAll: req.query.show_data_all || false,
    };
    try {
      const result = await model.getSingleItem(params, mappings);

      // Aggregate complete response using Aggregator
      const data = Aggregator.aggregateSingleItemResponse(result, mappings, params.showDataAll);

      // Set appropriate Content-Type header
      if (req.api && req.api.contentType) {
        res.type(req.api.contentType);
      }

      // Format response based on requested format
      const format = req.api && req.api.format ? req.api.format : 'json';

      if (format === 'json') {
        res.json({ data });
      } else if (format === 'lido') {
        // TODO: Implement LIDO transformation
        res.status(501).json({ 
          error: 'LIDO format not yet implemented',
          message: 'LIDO transformation will be added in the next step'
        });
      } else {
        res.json({ data });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, error: err.message });
    }
  };
}

function getItems(mappings) {
  return async (req, res) => {
    const params = {
      entityTypes: mappings.getEntityTypes(),
      filters: req.api.filterParams,
      from: req.api.from,
      language: req.query.language,
      size: req.api.size,
      searchterms: req.api.searchtermParams,
      showDataAll: req.query.show_data_all || false,
      sort: req.api.sortParams,

      geoData: req.path.match(/\/geodata\/?$/)
    };

    const { query } = req;

    // }
    try {
      const rawResult = await model.getItems(mappings, query, params);

      // Aggregate complete response using Aggregator
      const result = params.geoData 
        ? Aggregator.aggregateGeoDataResponse(rawResult.result)
        : Aggregator.aggregateItemsResponse(
          rawResult.result, rawResult.queryBuilder, mappings, params
        );

      // Set appropriate Content-Type header
      if (req.api && req.api.contentType) {
        res.type(req.api.contentType);
      }

      // Format response based on requested format
      const format = req.api && req.api.format ? req.api.format : 'json';

      if (format === 'json') {
        res.json({ data: result });
      } else if (format === 'lido') {
        // TODO: Implement LIDO transformation
        res.status(501).json({ 
          error: 'LIDO format not yet implemented',
          message: 'LIDO transformation will be added in the next step'
        });
      } else {
        res.json({ data: result });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, error: err.message });
    }
  };
}

module.exports = {
  getSingleItem,
  getItems,
};
