const model = require('../models');
const { entityTypes } = require('../mappings');

async function getSingleItem(req, res) {
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
    const result = await model.getSingleItem(params);
    res.json({ data: result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getItems(req, res) {
  let entityType = null;
  const entityTypePath = req.path.slice(1);
  if(entityTypePath.length > 0) {
    if (entityTypes[entityTypePath]) {
      entityType = entityTypePath;
    } else {
      res.status(404).json({
        error: true,
        data: 'Resource not found',
      });
    }  
  }

  const params = {
    entityType: entityType || null,
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
    const result = await model.getItems(query, params);
    res.json({ data: result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getSingleItem,
  getItems,
};
