const fs = require('fs');
const http = require('http');
const https = require('https');

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');

const routes = require('./routes');
require('dotenv').config();

const app = express();
const port = process.env.NODE_PORT || 8080;
const useHTTPS = process.env.HTTPS || false;

function start() {
  if (!process.env.ELASTICSEARCH_USERNAME || !process.env.ELASTICSEARCH_PASSWORD) {
    throw new Error('Enviroment variables are missing');
  }
  let httpServer = null;

  if (useHTTPS === true) {
    if (!process.env.DOMAIN) {
      throw new Error('Enviroment variables  DOMAIN is missing');
    }

    const domain = process.env.DOMAIN;
    const options = {
      cert: fs.readFileSync(`/etc/letsencrypt/live/${domain}/fullchain.pem`, 'utf8'),
      key: fs.readFileSync(`/etc/letsencrypt/live/${domain}/privkey.pem`, 'utf8')
    };

    httpServer = https.createServer(options, app);
  } else {
    httpServer = http.createServer(app);
  }

  httpServer.listen(port, () => console.log(`Server ready on port ${port}`));

  return app.use(cors())
    .use(bodyParser.urlencoded({ extended: false }))
    .use(bodyParser.json())
    .use('/', routes)
    .use((_req, res) => res.status(404).json({ success: false, error: 'Route not found' }))
}

module.exports = {
  start,
};
