const { Client } = require('@elastic/elasticsearch');

const elasticUrl = process.env.ELASTIC_URL || 'http://cranach-es:9200';
const esclient = new Client({
  node: elasticUrl,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
  },
});

const indicesPrefix = process.env.ELASTICSEARCH_INDICES_PREFIX;
const indices = {
  de: `${indicesPrefix}de`,
  en: `${indicesPrefix}en`,
};

function getIndexByLanguageKey(key) {
  return indices[key];
}

/**
 * @function checkConnection
 * @returns {Promise<Boolean>}
 * @description Checks if the client is connected to ElasticSearch
 */
// TODO: Function kann entfernt werden, da sie nicht benutzt wird
function checkConnection() {
  return new Promise(async (resolve) => {
    console.log('Checking connection to ElasticSearch...');
    let isConnected = false;
    while (!isConnected) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await esclient.cluster.health({});
        console.log('Successfully connected to ElasticSearch');
        isConnected = true;
      // eslint-disable-next-line no-empty
      } catch (_) {
      }
    }
    resolve(true);
  });
}

module.exports = {
  esclient,
  checkConnection,
  getIndexByLanguageKey,
};
