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
  const params = { id, req };
  try {
    const result = await model.getSingleItem(params);
    res.json({ data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getItems(req, res) {
  const { query } = req;
  try {
    const result = await model.getItems(query);
    res.json({ data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getSingleItem,
  getItems,
};
