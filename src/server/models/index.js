/* eslint-disable no-underscore-dangle */
const { esclient, index, type } = require('../../elastic');
const { mappings } = require('../mappings');
const allowedFilters = mappings.filter((mapping) => mapping.filter === true);

function createESFilterMatchParams(filterParams) {
  let result = {};
  const allowedFilterKeys = allowedFilters.map((allowedFilter) => {
    return allowedFilter.key;
  });

  const filterParamsKeys = Object.keys(filterParams);
  const allowedFilterParams = [];

  // Getting only allowed allowed filter params
  filterParamsKeys.forEach((filterParamKey) => {
    if (allowedFilterKeys.includes(filterParamKey)) {
      allowedFilterParams[filterParamKey] = (filterParams[filterParamKey]);
    }
  });

  const matchParams = [];
  // create es filter params
  Object.keys(allowedFilterParams).forEach((filterKey) => {
    const mapping = mappings.find((mapping) => mapping.key == filterKey);
    matchParams.push({
      match: {
        [mapping.value]: allowedFilterParams[filterKey],
      },
    });
  });

  result = {
    bool: {
      must: matchParams,
    },
  };
  return result;
}


function createESQuery(params) {
  const currentAggs = { };
  if (params.filter) {
    params.filter.forEach((filterItem) => {
      currentAggs[filterItem.key] = {
        terms: {
          field: filterItem.display_value,
        },
        aggs: {
          [filterItem.key]: {
            terms: {
              field: filterItem.value,
            },
          },
        },
      };
    });
  }
  const esParams = {
    from: params.req.from || 0,
    size: params.req.size || 100,
    index: params.index,
    type: params.type,
    // body: { params.query, aggs: currentAggs},
    body: {
      query: params.query,
      aggs: currentAggs,
    },
  };
  return esParams;
}

async function submitESSearch(params) {
  const esParams = createESQuery(params);
  try {
    const result = await esclient.search(esParams);
    return result;
  }
  catch (error) {
    console.error(error.meta.body.error);
    throw new Error(`Elasticsearch does not provide a response: ${error.meta.body.error}`);
  }
}

function aggregateESResult(params) {
  const { body: { took, hits, aggregations = { } } } = params;
  const isAvailable = params.setAsAvailable || false;
  const filter = {};
  const meta = { };
  const result = { };

  meta.took = took;
  meta.hits = hits.total.value;

  // TODO: Create recursive function
  // aggregate Filter
  const aggregationKeys = Object.keys(aggregations);
  aggregationKeys.forEach((aggregationKey) => {
    const { buckets } = aggregations[aggregationKey];
    const currentFilter = buckets.map((bucket) => {
      const ret = {};
      ret.doc_count = bucket.doc_count;
      ret.value = bucket.key;
      ret.display_value = buckets[0].key;
      ret.is_availabe = isAvailable;
      return ret;
    });
    filter[aggregationKey] = currentFilter;
  });

  // aggregate results
  const results = hits.hits.map((hit) => ({
    _data_all: hit._source,
    id: hit._id,
    dating: hit._source.dating,
    images: hit._source.images,
    owner: hit._source.owner,
    titles: hit._source.titles,
    score: hit._score,
  }));

  if (Object.keys(filter).length > 0) {
    result.filters = filter;
  }

  result.meta = meta;
  result.results = results;
  return result;
}

async function getSingleGraphic(params) {
  const query = {
    match: {
      _id: params.id,
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

  const query = createESFilterMatchParams(req);
  console.log(query.bool.must);
  // const query = {
  //   match_all: { },
  // };

  const result = await submitESSearch({
    req,
    index,
    type,
    query,
    filter: allowedFilters,
  });
  result.setAsAvailable = true;
  const { meta, results, filters } = aggregateESResult(result);


  const ret = {};
  ret.meta = meta;
  ret.results = results;
  ret.filters = filters;
  return ret;
}

module.exports = {
  getSingleGraphic,
  getGraphics,
};
