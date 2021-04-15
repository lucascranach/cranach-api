/* eslint-disable no-underscore-dangle */
const { esclient, index } = require('../../elastic');
const { mappings, availableFilterTypes, specialParams } = require('../mappings');

const allowedFilters = mappings.filter((mapping) => mapping.filter === true);

function createESFilterMatchParams(filterParams) {
  let result = {};
  const filterParamsKeys = Object.keys(filterParams);
  const preparedESFilters = [];

  // ****** Validate filter params
  filterParamsKeys.forEach((filterParamKey) => {
    // Split filter param from query
    // eslint-disable-next-line prefer-const
    let [filterKey, filterType = 'eq'] = filterParamKey.split(':');

    const filterTypeGroup = availableFilterTypes[filterType];
    if (filterTypeGroup === undefined) {
      throw new TypeError(`Not allowed filter type <${filterType}>`);
    }

    const filteredFilter = allowedFilters.filter(
      (allowedFilter) => allowedFilter.key === filterKey,
    );

    if (filteredFilter.length > 1) {
      throw new TypeError(`filter key <${filterKey}> assigned serveral times`);
    }

    if (specialParams.includes(filterKey)) {
      return;
    }

    if (filteredFilter.length === 0) {
      throw new TypeError(`Not allowed filter key <${filterKey}>`);
    }

    if (!filteredFilter[0].filter_types.includes(filterTypeGroup)) {
      throw new TypeError(`Not allowed filter type <${filterType}> for filter key <${filterKey}>`);
    }

    if (filterTypeGroup === 'notrange') {
      // cut the charachter 'n' at the beginning of the filter key
      filterType = filterType.replace(/^n/, '');
    }

    const preparedESFilter = {
      key: filteredFilter[0].value,
      type: filterType,
      typeGroup: filterTypeGroup,
      value: filterParams[filterParamKey],
      boolClause: (filterTypeGroup === 'equals' || filterTypeGroup === 'range') ? 'should' : 'must_not',
    };

    preparedESFilters.push(preparedESFilter);
  });

  // ****** Create ES filter params
  const matchParams = [];
  preparedESFilters.forEach((preparedESFilter) => {
    if (preparedESFilter.typeGroup === 'equals' || preparedESFilter.typeGroup === 'notequals') {
      matchParams.push({
        bool: {
          [preparedESFilter.boolClause]: {
            match: {
              [preparedESFilter.key]: preparedESFilter.value,
            },
          },
        },
      });
    } else {
      matchParams.push({
        bool: {
          [preparedESFilter.boolClause]: {
            range: {
              [preparedESFilter.key]: {
                [preparedESFilter.type]: preparedESFilter.value,
              },
            },
          },
        },
      });
    }
  });

  result = {
    bool: {
      must: matchParams,
    },
  };

  return result;
}

function createESSearchParams(params) {
  const paramsArray = [];
  const currentAggs = { };
  paramsArray.push(
    {
      index: params.index,
    },
  );
  if (params.filter) {
    params.filter.forEach((filterItem) => {
      currentAggs[filterItem.key] = {
        terms: {
          field: filterItem.display_value,
          size: 1000,
        },
        aggs: {
          [filterItem.key]: {
            terms: {
              field: filterItem.value,
              size: 1000,
            },
          },
        },
      };
    });
  }
  const esParams = {
    from: params.req.from || 0,
    size: params.req.size || 100,
    // body: { params.query, aggs: currentAggs},
    query: params.query,
    aggs: currentAggs,
  };

  paramsArray.push(esParams);
  const result = { body: paramsArray };
  return result;
}

async function submitESSearch(params) {
  try {
    const result = await esclient.msearch(params);
    return result;
  } catch (error) {
    throw new Error(`Elasticsearch does not provide a response: ${JSON.stringify(error.meta.body.error)}`);
  }
}

function aggregateESResult(params) {
  const { body: { took, responses } } = params;
  const [responseAll, responseFiltered] = responses;
  const { hits, aggregations } = responseAll;

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
      ret.display_value = bucket.key;
      ret.value = bucket[aggregationKey].buckets[0].key;
      ret.is_availabe = isAvailable;
      return ret;
    });
    filter[aggregationKey] = currentFilter;
  });

  // TODO: Outsource mappings to Config
  // aggregate results
  // TODO: In DTOs bündeln
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

async function getSingleItem(req) {
  const query = {
    match: {
      _id: req.id,
    },
  };

  const searchParams = createESSearchParams({
    req,
    index,
    // type,
    query,
    filter: allowedFilters,
  });

  const result = await submitESSearch(searchParams);

  const { meta, results } = aggregateESResult(result);

  return {
    meta,
    results,
  };
}

async function getItems(req) {
  const query = createESFilterMatchParams(req);
  const searchParams = createESSearchParams({
    req,
    index,
    query,
    filter: allowedFilters,
  });

  const result = await submitESSearch(searchParams);
  result.setAsAvailable = true;
  const { meta, results, filters } = aggregateESResult(result);

  const ret = {};
  ret.meta = meta;
  ret.results = results;
  ret.filters = filters;
  return ret;
}

module.exports = {
  getSingleItem,
  getItems,
};
