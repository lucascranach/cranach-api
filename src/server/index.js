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
<<<<<<< Updated upstream
=======
  let httpServer = null;

  if (useHTTPS === true) {
    if (!process.env.DOMAIN) {
      throw new Error('Enviroment variable DOMAIN is missing');
    }

    const domain = process.env.DOMAIN;
    const options = {
      cert: fs.readFileSync(`/etc/letsencrypt/live/${domain}/fullchain.pem`, 'utf8'),
      key: fs.readFileSync(`/etc/letsencrypt/live/${domain}/privkey.pem`, 'utf8'),
    };

    httpServer = https.createServer(options, app);
  } else {
    httpServer = http.createServer(app);
  }

  httpServer.listen(port, () => console.log(`Server ready on port ${port}`));
>>>>>>> Stashed changes

  return app.use(cors())
    .use(bodyParser.urlencoded({ extended: false }))
    .use(bodyParser.json())
    .use('/', routes)
<<<<<<< Updated upstream
    .use((_req, res) => res.status(404).json({ success: false, error: 'Route not found' }))
    .listen(port, () => console.log(`Server ready on port ${port}`));
=======
    .use((_req, res) => res.status(404).json({ success: false, error: 'Route not found' }));
>>>>>>> Stashed changes
}

module.exports = {
  start,
};
