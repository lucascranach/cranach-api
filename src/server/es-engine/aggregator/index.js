class Aggregator {
  static aggregateGeoData(dataHits) {
    const results = [];
    dataHits.forEach((hit) => {
      const data = hit._source;
      if (!data.locations || !data.locations.length) {
        return;
      }
      const location = data.locations[0];
      if (!location.geoPosition) {
        return;
      }
      const item = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [location.geoPosition.lng, location.geoPosition.lat],
        },
        properties: {
          dating: data.metadata.date,
          img_src: data.metadata.imgSrc,
          inventory_number: data.inventoryNumber,
          involved_person: data.involvedPersons[0].name,
          location: location.term,
          // only take the first line of the medium
          medium: data.medium.split('\n')[0],
          owner: data.repository,
          title: data.metadata.title,
        },
      };
      results.push(item);
    });

    return results;
  }

  static aggregateESFilterBuckets(params) {
    const { setAsAvailable } = params;
    const { aggregations } = params;
    const { allFilters } = params;
    const { mappings } = params;

    // TODO: Create recursive function
    // aggregate Filter
    const filters = {};
    const aggregationKeys = Object.keys(aggregations);
    aggregationKeys.forEach((aggregationKey) => {
      let currentAggregation = aggregations[aggregationKey];

      // if nested field then take nested values
      if (mappings.isNestedFilter(aggregationKey)) {
        currentAggregation = currentAggregation[aggregationKey];
      }
      const { buckets } = currentAggregation;

      // Filter out empty buckets
      let currentFilter = buckets.filter((bucket) => {
        if (bucket[aggregationKey].buckets.length > 0) {
          return true;
        }
        return false;
      });

      currentFilter = currentFilter.map((bucket) => {
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

  static aggregateESResult(params, mappings, showDataAll = false) {
    const visibleResults = mappings.getVisibleResults();
    const searchTermFields = mappings.getSearchTermFields();

    const response = params;
    const { hits } = response;

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

    return results;
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
