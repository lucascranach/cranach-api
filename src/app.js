const elastic = require('./elastic');
const server = require('./server');
require('dotenv').config();

server.start();
