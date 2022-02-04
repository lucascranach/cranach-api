/* eslint-disable no-underscore-dangle */
const path = require('path');
const FilterParam = require('../../entities/filterparam');

// TODO: Über fs module lösen
const translations = require(path.join(__dirname, '..', 'translations'));

const { esclient, getIndexByLanguageKey } = require(path.join(__dirname, '..', '..', 'elastic'));
const {
  isFilterInfosFilter,
  isNestedFilter,
  getSearchTermFields,
  getVisibleFilters,
  getVisibleResults,
  getFilterByKey,
} = require('../mappings');

// TODO: Über fs module lösen
const filterInfos = require(path.join(__dirname, '..', 'assets', 'json', 'cda-filters.json'));
const Querybuilder = require(path.join(__dirname, '..', 'es-engine', 'query-builder'));

const searchTermFields = getSearchTermFields();
const visibleFilters = getVisibleFilters();
const visibleResults = getVisibleResults();

// Delete function
function createSearchtermParams(searchtermObject) {
  const preparedESFilters = [];
  if (searchtermObject) {
    searchtermObject.fields.forEach((searchTermField) => {
      const param = {
        wildcard: {
          [searchTermField]: `*${searchtermObject.value}*`,
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
  return preparedESFilters;
}

function createHighlightParams(searchtermObject) {
  const preparedParams = {};
  if (searchtermObject) {
    searchtermObject.fields.forEach((field) => {
      preparedParams[field] = {};
    });
    return { fields: preparedParams };
  }
  return preparedParams;
}

function createESFilterMatchParams(filterParams) {
  if (!filterParams) {
    return { };
  }
  let result = {};
  const preparedESFilters = [];
  const filterParamsKeys = Object.keys(filterParams);

  filterParams.forEach((filterParam) => {
    const { filterTypeGroup } = filterParam;
    let { operator } = filterParam;

    if (filterTypeGroup === 'notrange') {
      // cut the character 'n' at the beginning of the filter key
      operator = operator.replace(/^n/, '');
    } else if (filterTypeGroup === 'multiequals') {
      // cut the character 'm' at the beginning of the filter key
      operator = operator.replace(/^m/, '');
    }

    let boolClause = '';
    if (filterTypeGroup === 'equals' || filterTypeGroup === 'range' || filterTypeGroup === 'multiequals') {
      boolClause = 'must';
    } else if (filterTypeGroup === 'differ') {
      boolClause = 'must';
    } else {
      boolClause = 'must_not';
    }
    const preparedESFilter = {
      key: filterParam.valueField,
      type: operator,
      typeGroup: filterTypeGroup,
      value: filterParam.values,
      boolClause,
      nestedPath: filterParam.nestedPath,
      sortBy: filterParam.sortBy,
    };
    preparedESFilters.push(preparedESFilter);
  });

  // ****** Create ES filter params
  const matchParams = {};
  matchParams.queryParams = [];
  matchParams.sortParams = {};
  const nestedParams = {};

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
          [preparedESFilter.boolClause]: {
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

      if (!nestedParams[preparedESFilter.nestedPath]) {
        nestedParams[preparedESFilter.nestedPath] = [];
      }

      nestedParams[preparedESFilter.nestedPath].push(copyFilterParam);
    } else {
      matchParams.queryParams.push(filterParam);
    }
  });

  // Group nested queries by path
  Object.keys(nestedParams).forEach((nestedPath) => {
    const nestedQueryParam = {
      nested: {
        path: [nestedPath],
        query: {
          bool: {
            must: [],
          },
        },
      },
    };
    nestedParams[nestedPath].forEach((queryParam) => {
      nestedQueryParam.nested.query.bool.must.push(queryParam);
    });
    matchParams.queryParams.push(nestedQueryParam);
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

function aggregateESResult(params, showDataAll = false) {
  const response = params;
  const { hits } = response;
  const meta = {};
  const result = {};
  // aggregate results
  // TODO: In DTOs bündeln
  const results = hits.hits.map((hit) => {
    const item = {};
    if (showDataAll === 'true') {
      item.data_all = hit._source;
    }

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
  const showDataAll = req.show_data_all;

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

  const results = aggregateESResult(result.body.responses[0], showDataAll);

  return {
    meta,
    results,
  };
}

async function getItems(req, params) {
  const queryBuilderFilteredItems = new Querybuilder();
  const queryBuilderAllItems = new Querybuilder();
  const queryBuildersMultiFilteredItems = [];

  const { language, showDataAll } = params;

  queryBuilderFilteredItems.paginate(params.from, params.size);
  queryBuilderAllItems.paginate(0, 0);

  params.sort.forEach((sortParamObject) => {
    queryBuilderFilteredItems.sortBy(sortParamObject);
  });

  if (params.searchterm) {
    params.searchterm.fields.forEach((field) => {
      queryBuilderFilteredItems.mustWildcard(new FilterParam('searchterm', params.searchterm.value, null, null, field, null, null));
      queryBuilderFilteredItems.highlight(new FilterParam('searchterm', params.searchterm.value, null, null, field, null, null));
    });
  }

  const index = getIndexByLanguageKey(language);

  const esParams = [];
  esParams.push(
    {
      index,
    },
  );

  params.filters.forEach((filter) => {
    switch (filter.operator) {
      case 'eq':
        queryBuilderFilteredItems.must(filter);
        break;
      case 'meq':
        queryBuilderFilteredItems.must(filter);
        break;
      case 'neq':
        queryBuilderFilteredItems.mustNot(filter);
        break;
      case 'diff':
        queryBuilderFilteredItems.mustWildcard(filter);
        break;
      default:
        queryBuilderFilteredItems.must(filter);
    }
  });




  // // Create search params for setted multi filters
  // filterParamsWithMultiEquals.forEach((multiEqualsParam) => {
  //   let filterParamsCopy = [...params.filterParams];
  //   filterParamsCopy = filterParamsCopy.filter((param) => multiEqualsParam.key !== param.key);

  //   const filterKey = multiEqualsParam.key;
  //   const filterMapping = getFilterByKey(filterKey);
  //   const currentQuery = createESFilterMatchParams(filterParamsCopy).queryParam;

  //   searchParamsMultiFilters[filterKey] = createESSearchParams({
  //     size: 0,
  //     index,
  //     query: currentQuery,
  //     filter: filterMapping,
  //     sort: queryBuilder.sortQuerie,
  //   });
  // });

  // // Hier geht es weiter
  // if (params.searchterm) {
  //   queryBuilderFilteredItems.highlight(params.searchterm);
  // }

  esParams.push(queryBuilderFilteredItems.query);

  // const searchtermParam = createSearchtermParams(params.searchterm);

  // console.log(JSON.stringify(esParams, null, 4));
  const resu = await submitESSearch({ body: esParams });

  return resu['body'];

  const highlightParams = createHighlightParams(params.searchterm);

  params.filters.searchterm = params.searchterm;
  const filterMatchParams = createESFilterMatchParams(params.filters);

  const query = filterMatchParams.queryParam;

  // TODO: Überprüfen ob diese Zeilen gelöscht werden können
  if (filterMatchParams.sortParam && Object.keys(filterMatchParams.sortParam).length > 0) {
    sortParam.unshift(filterMatchParams.sortParam);
  }


  const filterParamsWithMultiEquals = params.filters.filter((filterParam) => filterParam.operator === 'meq');
  const searchParamsMultiFilters = [];

  // Create search params for setted multi filters
  filterParamsWithMultiEquals.forEach((multiEqualsParam) => {
    let filterParamsCopy = [...params.filterParams];
    filterParamsCopy = filterParamsCopy.filter((param) => multiEqualsParam.key !== param.key);

    const filterKey = multiEqualsParam.key;
    const filterMapping = getFilterByKey(filterKey);
    const currentQuery = createESFilterMatchParams(filterParamsCopy).queryParam;

    searchParamsMultiFilters[filterKey] = createESSearchParams({
      size: 0,
      index,
      query: currentQuery,
      filter: filterMapping,
      sort: queryBuilder.sortQuerie,
    });
  });

  const searchParamsAllArticles = createESSearchParams({
    size: 0,
    index,
    query: { match_all: {} },
    filter: visibleFilters,
    sort: queryBuilder.sortQuerie,
  });

  const searchParamsFilteredArticles = createESSearchParams({
    ...req,
    index,
    query,
    filter: visibleFilters,
    sort: queryBuilder.sortQuerie,
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

  const results = aggregateESResult(result.body.responses[1], showDataAll);

  const ret = {};
  ret.meta = meta;
  ret.results = results.results;
  ret.filters = aggregationsAll;
  ret.highlights = result.body.responses[1].highlight;
  return ret;
}

module.exports = {
  getSingleItem,
  getItems,
};
