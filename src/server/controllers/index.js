const model = require('../models');

async function getSingleGraphic(req, res) {
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
    const result = await model.getSingleGraphic(params);
    res.json({ data: result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: 'Unknown error.' });
  }
}

async function getGraphics(req, res) {
  const { query } = req;
  try {
    const result = await model.getGraphics(query);
    res.json({ data: result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: 'Unknown error.' });
  }
}

module.exports = {
  getSingleGraphic,
  getGraphics,
};
