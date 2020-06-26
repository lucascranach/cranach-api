/* eslint-disable no-underscore-dangle */
const { esclient, index, type } = require('../../elastic');

async function submitESSearch(params) {
  const esParams = {
    from: params.req.from || 0,
    size: params.req.size || 100,
    index: params.index,
    type: params.type,
    body: params.query,
  };

  const result = await esclient.search(esParams);
  return result;
}
function aggregateESResult(params) {
  const { body: { took, hits } } = params;

  console.log('took', took);

  const result = { };
  const meta = { };
  meta.took = took;
  meta.hits = hits.total.value;

  const results = hits.hits.map((hit) => ({
    _data_all: hit._source,
    id: hit._id,
    dating: hit._source.dating,
    images: hit._source.images,
    owner: hit._source.owner,
    titles: hit._source.titles,
    score: hit._score,
  }));

  result.meta = meta;
  result.results = results;
  return result;
}

async function getSingleGraphic(params) {
  const query = {
    query: {
      match: {
        _id: params.id,
      },
    },
  };

  const result = await submitESSearch({
    req: params.req,
    index,
    type,
    query,
  });
  const { meta, results } = aggregateESResult(result);

  return {
    meta,
    results,
  };
}

async function getGraphics(req) {
  const query = {
    query: {
      match_all: { },
    },
  };

  const result = await submitESSearch({
    req,
    index,
    type,
    query,
  });
  const { meta, results } = aggregateESResult(result);

  return {
    meta,
    results,
  };
}

module.exports = {
  getSingleGraphic,
  getGraphics,
};
