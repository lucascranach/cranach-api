/* eslint-disable no-underscore-dangle */
const path = require('path');
const fs = require('fs');
const AggregationParam = require('../../entities/aggregationparam');
const FilterParam = require('../../entities/filterparam');
const SortParam = require('../../entities/sortparam');

const assetsDirectoryPath = path.join(__dirname, '..', 'assets');
const translations = require('../translations');

const { esclient, getIndexByLanguageKey } = require(path.join(__dirname, '..', '..', 'elastic'));
const {
  entityTypes,
  isFilterInfosFilter,
  getVisibleFilters,
  getMappingByKey,
  setMappings,
} = require('../mappings');

const filterInfos = {
  de: JSON.parse(fs.readFileSync(path.join(assetsDirectoryPath, 'filters', 'cda-filters.de.json'))),
  en: JSON.parse(fs.readFileSync(path.join(assetsDirectoryPath, 'filters', 'cda-filters.en.json'))),
};
const Querybuilder = require(path.join(__dirname, '..', 'es-engine', 'query-builder'));
const Aggregator = require(path.join(__dirname, '..', 'es-engine', 'aggregator'));

const visibleFilters = getVisibleFilters();

async function submitESSearch(params) {
  try {
    const result = await esclient.msearch(params);
    return result;
  } catch (error) {
    throw new Error(`Elasticsearch does not provide a response: ${JSON.stringify(error.meta.body.error)}`);
  }
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

  const results = Aggregator.aggregateESResult(result.body.responses[0], showDataAll);

  return {
    meta,
    results,
  };
}

async function getItems(req, params) {

  const queryBuilder = new Querybuilder();

  // Subresource was setted
  if (params.entityType) {
    const mapping = getMappingByKey('entity_type');
    const entityFilter = {
      key: 'entity_type',
      values: [entityTypes[params.entityType]],
      valueField: mapping.value,
      operator: 'eq',
    }

    queryBuilder.must(entityFilter);

    // Overwrite mappings
    const { mappings } = require(`../mappings/${params.entityType}`)
    setMappings( mappings );
  }

  const { language, showDataAll } = params;

  queryBuilder.index(getIndexByLanguageKey(language));
  queryBuilder.paginate(params.from, params.size);

  if (params.searchterms) {
    params.searchterms.forEach((searchtermFilterParam) => {
      queryBuilder.shouldInnerMustWildcard(searchtermFilterParam);
      queryBuilder.highlight(searchtermFilterParam);
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
      case 'sim':
        queryBuilder.mustWildcard(filter);
        break;
      case 'lt':
      case 'lte':
      case 'gt':
      case 'gte':
        if (filter.key === 'dating_begin' && filter.operator === 'gte') {
          const secondFilter = { ...filter };
          secondFilter.valueField = 'dating.end';
          secondFilter.operator = 'gte';
          secondFilter.key = 'dating_end';
          queryBuilder.softRange(filter, secondFilter);
          queryBuilder.sortBy(new SortParam(getMappingByKey('score').value, 'desc'));
        } else if (filter.key === 'dating_end' && filter.operator === 'lte') {
          const secondFilter = { ...filter };
          secondFilter.valueField = 'dating.begin';
          secondFilter.operator = 'lte';
          secondFilter.key = 'dating_begin';
          queryBuilder.softRange(filter, secondFilter);
          queryBuilder.sortBy(new SortParam(getMappingByKey('score').value, 'desc'));
        } else {
          queryBuilder.range(filter);
        }
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

  // Aggregate unfiltered filter buckets
  const aggregationsAll = Aggregator.aggregateESFilterBuckets({
    aggregations: result.body.responses[0].aggregations,
    setAsAvailable: false,
    allFilters: true,
  });

  // Aggregate filtered filter buckets
  const aggregationsFiltered = Aggregator.aggregateESFilterBuckets({
    aggregations: result.body.responses[1].aggregations,
    setAsAvailable: true,
  });

  // Aggregate filter buckets of multi filters
  const mustMultiFilters = queryBuilder.getMustMultiFilters();

  const agregationsMultiFilter = {};
  Object.keys(mustMultiFilters).forEach((searchParamsMultiFilter, currentIndex) => {
    const currentAggregation = Aggregator.aggregateESFilterBuckets({
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
    const currentAggregationFiltered = aggregationsFiltered[aggregationKey];
    const filterInfosClone = JSON.parse(JSON.stringify(filterInfos[req.language]));

    // Aggregate filterInfos filter
    if (isFilterInfosFilter(aggregationKey)) {
      const currentFilterInfos = filterInfosClone.find(filter => filter.id === aggregationKey);
      Aggregator.aggregateFilterInfos(currentFilterInfos.children, currentAggregationFiltered);
      aggregationsAll[aggregationKey] = {
        display_value: currentFilterInfos.text,
        value: currentFilterInfos.children,
      };

      // Aggregate other filters
    } else {
      currentAggregationFiltered.forEach((aggregationFiltered) => {
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

  // Enrich filter keys with translations
  Object.entries(aggregationsAll).forEach(([aggregationKey, aggregationData]) => {
    const translationKey = translations.getTranslation(aggregationKey, language) || aggregationKey;
    aggregationsAll[aggregationKey] = {
      display_value: aggregationsAll[aggregationKey].display_value || translationKey || aggregationKey,
      values: aggregationsAll[aggregationKey].value || aggregationData,
    };
  });

  const { body: { took } } = result;
  const meta = {
    took,
    hits: result.body.responses[1].hits.total.value,
  };

  const results = Aggregator.aggregateESResult(result.body.responses[1], showDataAll);

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
