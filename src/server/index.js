const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');
require('dotenv').config();

const app = express();
const port = process.env.NODE_PORT || 8080;

function start() {
  if (!process.env.ELASTICSEARCH_USERNAME || !process.env.ELASTICSEARCH_PASSWORD) {
    throw new Error('Environt variables are missing');
  }

  return app.use(cors())
    .use(bodyParser.urlencoded({ extended: false }))
    .use(bodyParser.json())
    .use('/graphics', routes)
    .use((_req, res) => res.status(404).json({ success: false, error: 'Route not found'}))
    .listen(port, () => console.log(`Server ready on port ${port}`));
}

module.exports = {
  start,
};
