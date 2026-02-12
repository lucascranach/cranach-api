const model = require('../models');
const Aggregator = require('../es-engine/aggregator');
const FormatterFactory = require('../formatters/formatter-factory');

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
      const result = await model.getSingleItem(mappings, params);

      // Aggregate complete response using Aggregator
      const data = Aggregator.aggregateSingleItemResponse(result, mappings, params.showDataAll);

      // Format response based on requested format
      const format = req.api && req.api.format ? req.api.format : 'json';
      const formatter = FormatterFactory.getFormatter(format, mappings);

      const output = formatter.formatSingleItem(data, params.language);

      // Send formatted output with correct content type
      res.type(formatter.getContentType()).send(output);
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
      geoData: req.path.match(/\/geodata\/?$/),
    };



    const { query } = req;

    // }
    try {
      const rawResult = await model.getItems(mappings, query, params);

      // Aggregate complete response using Aggregator
      const result = params.geoData
        ? Aggregator.aggregateGeoDataResponse(rawResult.result)
        : Aggregator.aggregateItemsResponse(
          rawResult.result, rawResult.queryBuilder, mappings, params,
        );

      // Format response based on requested format
      const format = req.api && req.api.format ? req.api.format : 'json';
      const formatter = FormatterFactory.getFormatter(format, mappings);

      if (format === 'lido') {
        // LIDO format for multiple items not yet implemented
        res.status(501).json({ 
          error: 'LIDO format for multiple items not yet implemented',
          message: 'Currently only single item LIDO export is supported'
        });
        return;
      }

      const output = formatter.formatItems(result, params);

      // Send formatted output with correct content type
      res.type(formatter.getContentType()).send(output);
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
