const {
  getVisibleResults,
  isNestedFilter,
  getSearchTermFields,
} = require('../../mappings');

class Aggregator {
  static aggregateESFilterBuckets(params) {
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

  static aggregateESResult(params, showDataAll = false) {
    const visibleResults = getVisibleResults();
    const searchTermFields = getSearchTermFields();

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

  static aggregateFilterInfos(filterInfos, aggregation) {
    Aggregator.traverse(filterInfos, Aggregator.enrichDocCounts, {
      esAggregation: aggregation,
    });
  }

  // called with every property and its value
  static enrichDocCounts(value, data) {
    const { esAggregation } = data;

    const currentAggregation = esAggregation.find(
      (aggregation) => aggregation.value === value.id,
    );

    if (currentAggregation) {
      value.doc_count = currentAggregation.doc_count;
      value.is_available = true;
    }
    else {
      value.doc_count = 0;
      value.is_available = false;
    }
  }

  static traverse(obj, func, data) {
    Object.values(obj).forEach((value) => {
      func(value, data);

      const { children } = value || {};
      if (Array.isArray(children)) {
        Aggregator.traverse(value.children, func, data);
      }
    });
  }
}

module.exports = Aggregator;
