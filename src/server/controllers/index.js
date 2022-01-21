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
    language: req.query.language,
    sort: req.api.sortParams,
    filters: req.api.filterParams,
    filterMultiEquals: req.api.filterParamsMultiEquals,
    showDataAll: req.show_data_all || false,
    searchterm: req.api.searchtermParam,
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
