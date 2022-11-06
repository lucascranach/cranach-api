const model = require('../models');
const { Mappings } = require('../mappings');

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
    };
    try {
      const result = await model.getSingleItem(params, mappings);
      res.json({ data: result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
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
    };

    const { query } = req;

    // }
    try {
      const result = await model.getItems(mappings, query, params);
      res.json({ data: result });
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
