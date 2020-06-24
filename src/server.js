'use strict'

const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: 'http://cranach-elk:9200/' });
const express = require('express');

const cors = require('cors');

// Constants
const PORT = 8080;

// App
const app = express();

app.use(cors());
app.get('/', (req, res) => {
  client.search({
    index: 'paintings_de',
    body: {
      query: {
        match_all: {}
      },
    },
  }, (err, result) => {
    if (err) console.log(err);
    res.send(result);
  });
});

app.listen(PORT);
console.log(`Running on http://localhost:${PORT}`);