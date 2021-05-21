/* eslint-disable no-underscore-dangle */
const fs = require('fs');
const path = require('path');
const { esclient, index } = require('../../elastic');
const {
  availableFilterTypes,
  availableSortTypes,
  defaultFilterType,
  defautSortDirection,
  specialParams,
  isThesaurusFilter,
  getAllowedFilters,
  getDefaultSortField,
  getSortableFields,
} = require('../mappings');

const allowedFilters = getAllowedFilters();
const sortableFields = getSortableFields();

function createESSortParam(filterParams) {
  let sortField = null;
  let sortDirectionParam = null;

  if (!filterParams.sort_by) {
    sortField = getDefaultSortField();
    sortDirectionParam = defautSortDirection;
  } else {
    if (Array.isArray(filterParams.sort_by)) {
      throw new TypeError('Serveral sort params are not allowed');
    }
    let sortFieldParam = null;
    [sortFieldParam, sortDirectionParam = defautSortDirection] = filterParams.sort_by.split('.');
    const sortDirection = availableSortTypes[sortDirectionParam];

    if (sortDirection === undefined) {
      throw new TypeError(`Not allowed sort direction <${sortDirection}>`);
    }

    sortField = sortableFields.find(
      (sortableField) => sortableField.key === sortFieldParam,
    );

    if (!sortField) {
      throw new TypeError(`Not allowed sort field <${sortField}>`);
    }
  }

  const sortParams = [{
    [sortField.value]: {
      order: sortDirectionParam,
    },
  }];

  return sortParams;
}

function createESFilterMatchParams(filterParams) {
  let result = {};
  const filterParamsKeys = Object.keys(filterParams);
  const preparedESFilters = [];

  // ****** Validate filter params
  filterParamsKeys.forEach((filterParamKey) => {
    // Split filter param from query
    // eslint-disable-next-line prefer-const
    let [filterKey, filterType = defaultFilterType] = filterParamKey.split(':');

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
    from: params.from || 0,
    size: params.size || 100,
    // body: { params.query, aggs: currentAggs},
    query: params.query,
    aggs: currentAggs,
    sort: params.sort,
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

function aggregateESFilterBuckets(params) {
  const { aggregations } = params;
  const { allFilters } = params;

  // TODO: Create recursive function
  // aggregate Filter
  const filters = {};
  const aggregationKeys = Object.keys(aggregations);
  aggregationKeys.forEach((aggregationKey) => {
    const { buckets } = aggregations[aggregationKey];
    const currentFilter = buckets.map((bucket) => {
      const ret = {};
      ret.doc_count = (allFilters ? 0 : bucket.doc_count);
      ret.display_value = bucket.key;
      ret.value = bucket[aggregationKey].buckets[0].key;
      ret.is_available = false;
      return ret;
    });
    filters[aggregationKey] = currentFilter;
  });
  return filters;
}

function aggregateESResult(params) {
  const { body: { took, responses } } = params;
  const [responseAll] = responses;
  const { hits } = responseAll;

  const meta = { };
  const result = { };

  meta.took = took;
  meta.hits = hits.total.value;

  // TODO: Outsource mappings to Config
  // aggregate results
  // TODO: In DTOs bündeln
  const results = hits.hits.map((hit) => ({
    _data_all: hit._source,
    id: hit._id,
    date: hit._source.metadata.date,
    classification: hit._source.metadata.classification,
    images: hit._source.images,
    owner: hit._source.owner,
    title: hit._source.metadata.title,
    subtitle: hit._source.metadata.subtitle,
    score: hit._score,
    sorting_number: hit._source.sortingNumber,
  }));

  result.meta = meta;
  result.results = results;
  return result;
}

// called with every property and its value
function enrichDocCounts(value, esAggregation) {
  const currentValue = value;
  const id = value.alt.dkultTermIdentifier;
  const currentAggregation = esAggregation.filter((aggregation) => aggregation.display_value === id);
  if (currentAggregation[0]) {
    currentValue.doc_count = currentAggregation[0].doc_count;
    currentValue.is_available = true;
  }
  else {
    currentValue.doc_count = 0;
    currentValue.is_available = false;
  }
}

function traverse(obj, esAggregation, func) {
  Object.values(obj).forEach((value) => {
    func(value, esAggregation);

    const { subTerms } = value || {};
    if (Array.isArray(subTerms)) {
      traverse(value.subTerms, esAggregation, func);
    }
  });
};

async function getSingleItem(req) {
  const query = {
    match: {
      _id: req.id,
    },
  };

  const searchParams = createESSearchParams({
    ...req,
    index,
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
  const thesaurusRaw = fs.readFileSync(path.join(__dirname, 'assets', '..', '..', 'assets', 'json', 'cda-reduced-thesaurus-v2.json'));
  const thesaurusJSON = JSON.parse(thesaurusRaw);

  const sortParam = createESSortParam(req);
  const query = createESFilterMatchParams(req);

  const searchParamsAllArticles = createESSearchParams({
    size: '0',
    index,
    query: { match_all: { } },
    filter: allowedFilters,
    sort: sortParam,
  });

  const searchParamsFilteredArticles = createESSearchParams({
    ...req,
    index,
    query,
    filter: allowedFilters,
    sort: sortParam,
  });

  const searchParams = {
    body: searchParamsAllArticles.body.concat(searchParamsFilteredArticles.body),
  };

  const result = await submitESSearch(searchParams);

  const aggregationsAll = aggregateESFilterBuckets({
    aggregations: result.body.responses[0].aggregations,
    setAsAvailable: false,
    allFilters: true,
  });

  const aggregationsFiltered = aggregateESFilterBuckets({
    aggregations: result.body.responses[1].aggregations,
    setAsAvailable: true,
  });

  const aggregationKeys = Object.keys(aggregationsAll);

  // Merge all and available filters
  aggregationKeys.forEach((aggregationKey) => {
    const currentAggregationAll = aggregationsAll[aggregationKey];
    const currenAggregationFiltered = aggregationsFiltered[aggregationKey];

    // Aggregate thesaurus filter
    if (isThesaurusFilter(aggregationKey)) {
      traverse(thesaurusJSON.rootTerms, currenAggregationFiltered, enrichDocCounts);
      aggregationsAll[aggregationKey] = thesaurusJSON.rootTerms;

    // Aggregate other filters
    } else {
      currenAggregationFiltered.forEach((aggregationFiltered) => {
        // eslint-disable-next-line arrow-body-style
        const indexOfAggregation = currentAggregationAll.findIndex((aggregationAll) => {
          return aggregationAll.display_value === aggregationFiltered.display_value;
        });
        if (indexOfAggregation > -1) {
          aggregationsAll[aggregationKey][indexOfAggregation].is_available = true;
          // eslint-disable-next-line max-len
          aggregationsAll[aggregationKey][indexOfAggregation].doc_count = aggregationFiltered.doc_count;
        }
      });
    }
  });

  result.body.responses.shift();

  const { meta, results } = aggregateESResult(result);

  const ret = {};
  ret.meta = meta;
  ret.results = results;
  ret.filters = aggregationsAll;
  return ret;
}

module.exports = {
  getSingleItem,
  getItems,
};
