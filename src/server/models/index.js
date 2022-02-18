/* eslint-disable no-underscore-dangle */
const path = require('path');
const AggregationParam = require('../../entities/aggregationparam');
const FilterParam = require('../../entities/filterparam');
const SortParam = require('../../entities/sortparam');

// TODO: Über fs module lösen
const translations = require(path.join(__dirname, '..', 'translations'));

const { esclient, getIndexByLanguageKey } = require(path.join(__dirname, '..', '..', 'elastic'));
const {
  isFilterInfosFilter,
  isNestedFilter,
  getSearchTermFields,
  getVisibleFilters,
  getVisibleResults,
} = require('../mappings');

// TODO: Über fs module lösen
const filterInfos = require(path.join(__dirname, '..', 'assets', 'json', 'cda-filters.json'));
const Querybuilder = require(path.join(__dirname, '..', 'es-engine', 'query-builder'));

const searchTermFields = getSearchTermFields();
const visibleFilters = getVisibleFilters();
const visibleResults = getVisibleResults();

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

async function getSingleItem(params) {
  const queryBuilder = new Querybuilder();

  const { language, showDataAll } = params;

  queryBuilder.index(getIndexByLanguageKey(language));

  queryBuilder.must(new FilterParam('id', [params.id], 'eq', 'equals', '_id'));
  queryBuilder.size = 1;
  queryBuilder.from = 0;


  const result = await submitESSearch({ body: queryBuilder.query });
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
  const queryBuilder = new Querybuilder();

  const { language, showDataAll } = params;

  queryBuilder.index(getIndexByLanguageKey(language));
  queryBuilder.paginate(params.from, params.size);

  if (params.searchterm) {
    params.searchterm.fields.forEach((field) => {
      queryBuilder.mustWildcard(new FilterParam('searchterm', params.searchterm.value, null, null, field, null, null));
      queryBuilder.highlight(new FilterParam('searchterm', params.searchterm.value, null, null, field, null, null));
    });
  }

  // TODO: Must be solved via an enum
  params.filters.forEach((filter) => {
    switch (filter.operator) {
      case 'eq':
        queryBuilder.must(filter);
        break;
      case 'meq':
        queryBuilder.mustMulti(filter);
        break;
      case 'neq':
        queryBuilder.mustNot(filter);
        break;
      case 'diff':
        queryBuilder.mustWildcard(filter);
        break;
      case 'lt':
      case 'lte':
      case 'gt':
      case 'gte':
        queryBuilder.range(filter);
        break;
      case 'nlt':
      case 'nlte':
      case 'ngte':
      case 'ngt':
        queryBuilder.notRange(filter);
        break;
      default:
        queryBuilder.must(filter);
    }

    if (filter.nestedPath && filter.sortBy) {
      queryBuilder.sortBy(new SortParam(filter.valueField, 'asc', filter.nestedPath));
    }
  });

  params.sort.forEach((sortParamObject) => {
    queryBuilder.sortBy(sortParamObject);
  });

  visibleFilters.forEach((filter) => {
    const aggregationParam = new AggregationParam(
      filter.key,
      filter.value,
      filter.display_value,
      filter.nestedPath || null,
    );
    queryBuilder.termsAggregation(aggregationParam);
  });

  const result = await submitESSearch({ body: queryBuilder.query });

  const aggregationsAll = aggregateESFilterBuckets({
    aggregations: result.body.responses[0].aggregations,
    setAsAvailable: false,
    allFilters: true,
  });

  const aggregationsFiltered = aggregateESFilterBuckets({
    aggregations: result.body.responses[1].aggregations,
    setAsAvailable: true,
  });

  const mustMultiFilters = queryBuilder.getMustMultiFilters();

  const agregationsMultiFilter = {};
  Object.keys(mustMultiFilters).forEach((searchParamsMultiFilter, currentIndex) => {
    const currentAggregation = aggregateESFilterBuckets({
      aggregations: result.body.responses[currentIndex + 2].aggregations,
      setAsAvailable: true,
    });

    const filterKey = searchParamsMultiFilter.key;
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
