/* eslint-disable no-underscore-dangle */
const AggregationParam = require('../../entities/aggregationparam');
const FilterParam = require('../../entities/filterparam');
const SortParam = require('../../entities/sortparam');
const { esclient, getIndexByLanguageKey } = require('../../elastic');
const { Mappings } = require('../mappings');
const Querybuilder = require('../es-engine/query-builder');

async function submitESSearch(params) {
  try {
    const result = await esclient.msearch(params);
    return result;
  } catch (error) {
    console.error(`Elasticsearch does not provide a response: ${JSON.stringify(error.meta.body.error)}`);
    throw new Error(`Elasticsearch does not provide a response: ${JSON.stringify(error.meta.body.error)}`);
  }
}

async function getSingleItem(mappings, params) {
  const { language, fetchBothLanguages } = params;

  // Build query for primary language
  const queryBuilder = new Querybuilder();
  queryBuilder.index(getIndexByLanguageKey(language));
  queryBuilder.must(new FilterParam('id', [params.id], 'eq', 'equals', '_id'));
  queryBuilder.size = 1;
  queryBuilder.from = 0;

  let combinedQuery = queryBuilder.query;

  // If fetchBothLanguages is true (for LIDO format), add the other language query to msearch
  if (fetchBothLanguages) {
    const otherLanguage = language === 'de' ? 'en' : 'de';
    const queryBuilderOtherLang = new Querybuilder();
    queryBuilderOtherLang.index(getIndexByLanguageKey(otherLanguage));
    queryBuilderOtherLang.must(new FilterParam('id', [params.id], 'eq', 'equals', '_id'));
    queryBuilderOtherLang.size = 1;
    queryBuilderOtherLang.from = 0;

    // Combine both queries into a single msearch request
    combinedQuery = [...queryBuilder.query, ...queryBuilderOtherLang.query];
  }

  const result = await submitESSearch({ body: combinedQuery });

  return result;
}

async function getItems(mappings, req, params) {
  const queryBuilder = new Querybuilder();

  const entityTypeMapping = mappings.getMappingByKey('entity_type');
  const entityFilter = {
    key: 'entity_type',
    values: params.entityTypes,
    valueField: entityTypeMapping.value,
    operator: 'eq',
  };

  // Restrict filter aggregation to certain entity types
  queryBuilder.filterAggregation(entityFilter);

  // Restrict items to certain entity types
  queryBuilder.must(entityFilter);

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
          queryBuilder.sortBy(new SortParam(mappings.getMappingByKey('score').value, 'desc'));
        } else if (filter.key === 'dating_end' && filter.operator === 'lte') {
          const secondFilter = { ...filter };
          secondFilter.valueField = 'dating.begin';
          secondFilter.operator = 'lte';
          secondFilter.key = 'dating_begin';
          queryBuilder.softRange(filter, secondFilter);
          queryBuilder.sortBy(new SortParam(mappings.getMappingByKey('score').value, 'desc'));
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

  // Exclude certain inventory numbers
  const excludedInventoryNumbers = Mappings.excludedInvenoryNumbers;
  const mappingInventoryNumber = mappings.getMappingByKey('inventory_number');
  const excludeFilter = new FilterParam('inventory_number', excludedInventoryNumbers, 'neq', 'notequals', mappingInventoryNumber.value);
  queryBuilder.mustNot(excludeFilter);

  params.sort.forEach((sortParamObject) => {
    queryBuilder.sortBy(sortParamObject);
  });

  let result;
  let response;
  try {
    if (params.geoData) {
      result = await submitESSearch({ body: queryBuilder.query });
      [response] = result.body.responses;
    } else {
      mappings.getVisibleFilters().forEach((filter) => {
        const aggregationParam = new AggregationParam(
          filter.key,
          filter.value,
          filter.display_value,
          filter.nestedPath || null,
        );
        queryBuilder.termsAggregation(aggregationParam);
      });

      result = await submitESSearch({ body: queryBuilder.query });
      [, response] = result.body.responses;
    }
  } catch (error) {
    console.error(`Elasticsearch does not provide a response: ${JSON.stringify(error.meta.body.error)}`);
    throw new Error(`Elasticsearch does not provide a response: ${JSON.stringify(error.meta.body.error)}`);
  }

  return {
    result,
    queryBuilder,
  };
}

module.exports = {
  getSingleItem,
  getItems,
};
