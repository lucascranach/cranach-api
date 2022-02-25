const model = require('../models');

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
  const params = {
    filters: req.api.filterParams,
    from: req.api.from,
    language: req.query.language,
    size: req.api.size,
    searchterm: req.api.searchtermParam,
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
