/* eslint-disable no-underscore-dangle */
const path = require('path');

const translations = require(path.join(__dirname, '..', 'translations'));

const { esclient, getIndexByLanguageKey } = require(path.join(__dirname, '..', '..', 'elastic'));
const {
  availableFilterTypes,
  availableSortTypes,
  defaultFilterType,
  defautSortDirection,
  specialParams,
  isFilterInfosFilter,
  isNestedFilter,
  getAllowedFilters,
  getDefaultSortField,
  getSearchTermFields,
  getSortableFields,
  getVisibleFilters,
  getVisibleResults,
  getFilterByKey,
} = require('../mappings');

const filterInfos = require(path.join(__dirname, '..', 'assets', 'json', 'cda-filters.json'));

const allowedFilters = getAllowedFilters();
const searchTermFields = getSearchTermFields();
const sortableFields = getSortableFields();
const visibleFilters = getVisibleFilters();
const visibleResults = getVisibleResults();

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

function createSearchtermParams(searchTerm) {
  const preparedESFilters = [];
  searchTermFields.forEach((searchTermField) => {
    const param = {
      wildcard: {
        [searchTermField.value]: `*${searchTerm}*`,
      },
    };
    preparedESFilters.push(param);
  });
  return ({
    bool: {
      should: preparedESFilters,
    },
  });
}

function createHighlightParams(params) {
  const preparedParams = {};
  if (params.searchterm) {
    searchTermFields.forEach((searchTermField) => {
      preparedParams[searchTermField.value] = {};
    });
    return { fields: preparedParams };
  }
  return preparedParams;
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
      // cut the character 'n' at the beginning of the filter key
      filterType = filterType.replace(/^n/, '');
    }

    if (filterTypeGroup === 'multiequals') {
      // cut the character 'm' at the beginning of the filter key
      filterType = filterType.replace(/^m/, '');
    }

    let filterKeys = filterParams[filterParamKey];

    if (
      filterTypeGroup === 'equals'
      || filterTypeGroup === 'notequals'
      || filterTypeGroup === 'multiequals'
      || filterTypeGroup === 'differ'
    ) {
      filterKeys = filterParams[filterParamKey].split(',');
    }

    // Wildcard search allows only one filter value
    if (filterTypeGroup === 'differ') {
      [filterKeys] = filterKeys;
    }

    const preparedESFilter = {
      key: filteredFilter[0].value,
      type: filterType,
      typeGroup: filterTypeGroup,
      value: filterKeys,
      boolClause: (filterTypeGroup === 'equals' || filterTypeGroup === 'range' || filterTypeGroup === 'multiequals' || filterTypeGroup === 'differ') ? 'should' : 'must_not',
      nestedPath: filteredFilter[0].nestedPath || null,
      sortBy: (filteredFilter[0].nestedPath && filteredFilter[0].sortBy)
        ? filteredFilter[0].sortBy
        : null,
    };

    preparedESFilters.push(preparedESFilter);
  });

  // ****** Create ES filter params
  const matchParams = {};
  matchParams.queryParams = [];
  matchParams.sortParams = {};

  // Create query for searchtearm
  if (filterParamsKeys.includes('searchterm')) {
    const searchTermQueryParams = createSearchtermParams(filterParams.searchterm);
    matchParams.queryParams.push(searchTermQueryParams);
  }

  preparedESFilters.forEach((preparedESFilter) => {
    let filterParam = null;
    if (preparedESFilter.typeGroup === 'equals' || preparedESFilter.typeGroup === 'notequals' || preparedESFilter.typeGroup === 'multiequals') {
      filterParam = {
        bool: {
          [preparedESFilter.boolClause]: {
            terms: {
              [preparedESFilter.key]: preparedESFilter.value,
            },
          },
        },
      };
    } else if (preparedESFilter.typeGroup === 'differ') {
      filterParam = {
        bool: {
          should: {
            wildcard: {
              [preparedESFilter.key]: preparedESFilter.value,
            },
          },
        },
      };
    } else {
      filterParam = {
        bool: {
          [preparedESFilter.boolClause]: {
            range: {
              [preparedESFilter.key]: {
                [preparedESFilter.type]: preparedESFilter.value,
              },
            },
          },
        },
      };
    }

    // Prepare filter param for nested values
    if (preparedESFilter.nestedPath) {
      const copyFilterParam = { ...filterParam };
      filterParam = null;

      // Prepare filter for sorting nested values
      if (preparedESFilter.sortBy) {
        matchParams.sortParams[preparedESFilter.sortBy] = {
          order: 'asc',
          nested: {
            path: preparedESFilter.nestedPath,
            filter: {
              ...copyFilterParam,
            },
          },
        };
      }
      filterParam = {
        nested: {
          path: preparedESFilter.nestedPath,
          query: copyFilterParam,
        },
      };
    }
    matchParams.queryParams.push(filterParam);
  });
  result = {
    queryParam: {
      bool: {
        filter: matchParams.queryParams,
      },
    },
    sortParam: matchParams.sortParams,
  };

  return result;
}

function createESSearchParams(params) {
  const allParams = [];
  const allAggs = {};
  allParams.push(
    {
      index: params.index,
    },
  );
  if (params.filter) {
    params.filter.forEach((filterItem) => {
      let currentAggs = {
        terms: {
          field: filterItem.display_value,
          size: 1000,
        },
        aggs: {
          [filterItem.key]: {
            terms: {
              field: filterItem.value,
              size: 1,
            },
          },
        },
      };

      if (filterItem.nestedPath) {
        const copyCurrentAggs = { ...currentAggs };
        currentAggs = {
          nested: {
            path: filterItem.nestedPath,
          },
          aggs: {
            [filterItem.key]: copyCurrentAggs,
          },
        };
      }
      allAggs[filterItem.key] = currentAggs;
    });
  }

  const size = (typeof params.size === 'undefined') ? 100 : params.size;

  const esParams = {
    from: params.from || 0,
    size,
    query: params.query,
    aggs: allAggs,
    sort: params.sort,
    highlight: params.highlight || {},
  };

  allParams.push(esParams);
  const result = { body: allParams };
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
  const { setAsAvailable } = params;
  const { aggregations } = params;
  const { allFilters } = params;

  // TODO: Create recursive function
  // aggregate Filter
  const filters = {};
  const aggregationKeys = Object.keys(aggregations);
  aggregationKeys.forEach((aggregationKey) => {
    let currentAggregation = aggregations[aggregationKey];

    // if nested field then take nested values
    if (isNestedFilter(aggregationKey)) {
      currentAggregation = currentAggregation[aggregationKey];
    }
    const { buckets } = currentAggregation;
    const currentFilter = buckets.map((bucket) => {
      const ret = {};
      ret.doc_count = (allFilters ? 0 : bucket.doc_count);
      ret.display_value = bucket.key;
      ret.value = bucket[aggregationKey].buckets[0].key;
      ret.is_available = setAsAvailable || false;
      return ret;
    });
    filters[aggregationKey] = currentFilter;
  });
  return filters;
}

function aggregateESResult(params) {
  const response = params;
  const { hits } = response;

  const meta = {};
  const result = {};

  // aggregate results
  // TODO: In DTOs bündeln
  const results = hits.hits.map((hit) => {
    const item = {};
    item.data_all = hit._source;

    visibleResults.forEach((configItem) => {
      let currentObject = hit._source;

      // Split the display value
      const splittedDisplayValues = configItem.display_value.split('.');

      splittedDisplayValues.forEach((currentDisplayValue) => {
        // create Object of config parts
        currentObject = (currentObject[currentDisplayValue])
          ? currentObject[currentDisplayValue]
          : '';
      });
      item[configItem.key] = currentObject;
    });

    if (hit.highlight) {
      item._highlight = {};
      searchTermFields.forEach((configItem) => {
        if (hit.highlight[configItem.value]) {
          item._highlight[configItem.key] = hit.highlight[configItem.value];
        }
      });
    }
    return item;
  });

  result.meta = meta;
  result.results = results;
  return result;
}

// called with every property and its value
function enrichDocCounts(value, data) {
  const { esAggregation, language } = data;

  // eslint-disable-next-line max-len
  const currentAggregation = esAggregation.filter((aggregation) => aggregation.value === value.id);
  if (currentAggregation[0]) {
    value.doc_count = currentAggregation[0].doc_count;
    value.is_available = true;
  }
  else {
    value.doc_count = 0;
    value.is_available = false;
  }

  value.text = value.text[language];
}

function traverse(obj, func, data) {
  Object.values(obj).forEach((value) => {
    func(value, data);

    const { children } = value || {};
    if (Array.isArray(children)) {
      traverse(value.children, func, data);
    }
  });
}

async function getSingleItem(req) {
  const query = {
    match: {
      _id: req.id,
    },
  };
  const index = getIndexByLanguageKey(req.language);

  const searchParams = createESSearchParams({
    index,
    query,
    filter: visibleFilters,
  });

  const result = await submitESSearch(searchParams);
  const { body: { took } } = result;
  const meta = {
    took,
    hits: result.body.responses[0].hits.total.value,
  };

  const results = aggregateESResult(result.body.responses[0]);

  return {
    meta,
    results,
  };
}

async function getItems(req) {
  const { language } = req;
  let sortParam = createESSortParam(req);
  const filterMatchParams = createESFilterMatchParams(req);
  const query = filterMatchParams.queryParam;
  if (filterMatchParams.sortParam && Object.keys(filterMatchParams.sortParam).length === 0) {
    sortParam = filterMatchParams.sortParam;
  }

  const index = getIndexByLanguageKey(req.language);
  const highlightParams = createHighlightParams(req);
  const multiEqualsParams = Object.entries(req).filter((multiEqualsParam) => {
    const str = multiEqualsParam[0];

    // TODO: Swap to configuration variable
    const target = ':meq';
    return str.endsWith(target);
  });

  const searchParamsMultiFilters = [];

  // Create search params for setted multi filters
  multiEqualsParams.forEach((multiEqualsParam) => {
    const params = { ...req };
    params.size = '0';
    delete params[multiEqualsParam[0]];

    const filterKey = (multiEqualsParam[0].replace(/:meq$/, ''));
    const filterMapping = getFilterByKey(filterKey);
    const currentQuery = createESFilterMatchParams(params).queryParam;

    searchParamsMultiFilters[filterKey] = createESSearchParams({
      ...params,
      index,
      query: currentQuery,
      filter: filterMapping,
      sort: sortParam,
    });
  });

  const searchParamsAllArticles = createESSearchParams({
    size: 0,
    index,
    query: { match_all: {} },
    filter: visibleFilters,
    sort: sortParam,
  });


  const searchParamsFilteredArticles = createESSearchParams({
    ...req,
    index,
    query,
    filter: visibleFilters,
    sort: sortParam,
    highlight: highlightParams,
  });

  const searchParams = {
    body: searchParamsAllArticles.body.concat(searchParamsFilteredArticles.body),
  };

  Object.entries(searchParamsMultiFilters).forEach((searchParamsMultiFilter) => {
    searchParams.body = searchParams.body.concat(searchParamsMultiFilter[1].body);
  });

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

  const agregationsMultiFilter = {};
  Object.keys(searchParamsMultiFilters).forEach((searchParamsMultiFilterKey, currentIndex) => {
    const currentAggregation = aggregateESFilterBuckets({
      aggregations: result.body.responses[currentIndex + 2].aggregations,
      setAsAvailable: true,
    });

    const filterKey = searchParamsMultiFilterKey;
    // TODO: Das geht bestimmt auch eleganter
    agregationsMultiFilter[filterKey] = currentAggregation[filterKey];
  });

  const aggregationKeys = Object.keys(aggregationsAll);

  // Merge all and available filters
  aggregationKeys.forEach((aggregationKey) => {
    const currentAggregationAll = aggregationsAll[aggregationKey];
    const currenAggregationFiltered = aggregationsFiltered[aggregationKey];

    const filterInfosClone = JSON.parse(JSON.stringify(filterInfos));

    // Aggregate filterInfos filter
    if (isFilterInfosFilter(aggregationKey)) {
      const currentFilterInfos = filterInfosClone[aggregationKey];
      traverse(currentFilterInfos, enrichDocCounts, {
        esAggregation: currenAggregationFiltered,
        language: req.language,
      });
      aggregationsAll[aggregationKey] = currentFilterInfos;

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

  // Merge multi filters
  Object.entries(agregationsMultiFilter).forEach(([aggregationKey, aggregationData]) => {
    aggregationsAll[aggregationKey] = aggregationData;
  });

  // Enrich filter key with translations
  Object.entries(aggregationsAll).forEach(([aggregationKey, aggregationData]) => {
    const translationKey = translations.getTranslation(aggregationKey, language) || aggregationKey;
    aggregationsAll[aggregationKey] = {
      display_value: translationKey,
      values: aggregationData,
    };
  });

  const { body: { took } } = result;
  const meta = {
    took,
    hits: result.body.responses[1].hits.total.value,
  };

  const results = aggregateESResult(result.body.responses[1]);

  const ret = {};
  ret.meta = meta;
  ret.results = results;
  ret.filters = aggregationsAll;
  ret.highlights = result.body.responses[1].highlight;
  return ret;
}

module.exports = {
  getSingleItem,
  getItems,
};
