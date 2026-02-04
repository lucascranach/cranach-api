class Aggregator {
  static #filterInfos = null;
  static #translations = null;

  /**
   * Lazy load filter infos from JSON files
   * Loads and caches filter information on first access
   * @returns {Object} Filter infos with language keys (de, en)
   */
  static getFilterInfos() {
    if (!Aggregator.#filterInfos) {
      const path = require('path');
      const fs = require('fs');
      const assetsDirectoryPath = path.join(__dirname, '..', '..', 'assets');
      Aggregator.#filterInfos = {
        de: JSON.parse(fs.readFileSync(path.join(assetsDirectoryPath, 'filters', 'cda-filters.de.json'))),
        en: JSON.parse(fs.readFileSync(path.join(assetsDirectoryPath, 'filters', 'cda-filters.en.json'))),
      };
    }
    return Aggregator.#filterInfos;
  }

  /**
   * Lazy load translations module
   * Loads and caches translations on first access
   * @returns {Object} Translations module
   */
  static getTranslations() {
    if (!Aggregator.#translations) {
      Aggregator.#translations = require('../../translations');
    }
    return Aggregator.#translations;
  }

  /**
   * Transform Elasticsearch hits into GeoJSON features
   * Extracts location data and creates GeoJSON Feature objects
   * @param {Array} dataHits - Array of Elasticsearch hit objects
   * @returns {Array} Array of GeoJSON Feature objects
   */
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

  /**
   * Extract meta information from Elasticsearch result
   * @param {Object} esResult - Elasticsearch result
   * @param {Object} response - Response object
   * @returns {Object} Meta information
   */
  static buildMeta(esResult, response) {
    return {
      took: esResult.body.took,
      hits: response.hits.total.value,
    };
  }

  /**
   * Aggregate single item response
   * @param {Object} esResult - Complete Elasticsearch result
   * @param {Object} mappings - Mappings object
   * @param {boolean} showDataAll - Whether to include all data
   * @returns {Object} Complete response object with meta and results
   */
  static aggregateSingleItemResponse(esResult, mappings, showDataAll = false) {
    const response = esResult.body.responses[0];
    const meta = Aggregator.buildMeta(esResult, response);
    const results = Aggregator.aggregateESResult(response, mappings, showDataAll);

    return {
      meta,
      results,
    };
  }

  /**
   * Aggregate items response
   * @param {Object} esResult - Complete Elasticsearch result
   * @param {Object} queryBuilder - Query builder instance
   * @param {Object} mappings - Mappings object
   * @param {Object} params - Request parameters
   * @returns {Object} Complete response object with meta, results, and filters
   */
  static aggregateItemsResponse(esResult, queryBuilder, mappings, params) {
    const response = esResult.body.responses[1];
    const meta = Aggregator.buildMeta(esResult, response);

    // Aggregate filters
    const filters = Aggregator.aggregateAllFilters({
      esResult,
      mappings,
      queryBuilder,
      language: params.language,
    });

    // Aggregate results
    const results = Aggregator.aggregateESResult(response, mappings, params.showDataAll);

    return {
      meta,
      results,
      filters,
      highlights: response.highlight,
    };
  }

  /**
   * Aggregate geo data response to complete GeoJSON structure
   * @param {Object} esResult - Complete Elasticsearch result
   * @returns {Object} Complete GeoJSON FeatureCollection
   */
  static aggregateGeoDataResponse(esResult) {
    const response = esResult.body.responses[0];
    const meta = Aggregator.buildMeta(esResult, response);
    const features = Aggregator.aggregateGeoData(response.hits.hits);

    return {
      meta,
      features,
      type: 'FeatureCollection',
    };
  }

  /**
   * Aggregate Elasticsearch filter buckets into structured filter objects
   * Processes nested filters and marks availability
   * @param {Object} params - Parameters for aggregation
   * @param {boolean} params.setAsAvailable - Whether to mark filters as available
   * @param {Object} params.aggregations - Elasticsearch aggregations object
   * @param {boolean} params.allFilters - Whether to include all filters
   * @param {Object} params.mappings - Mappings object
   * @returns {Object} Aggregated filters keyed by filter name
   */
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

  /**
   * Aggregate Elasticsearch search results into structured item objects
   * Maps visible fields and adds highlight information
   * @param {Object} params - Elasticsearch response object
   * @param {Object} mappings - Mappings object defining visible fields
   * @param {boolean} showDataAll - Whether to include complete source data
   * @returns {Array} Array of aggregated item objects
   */
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

  /**
   * Aggregate filter infos by enriching them with document counts
   * Traverses filter tree and adds counts from aggregation
   * @param {Object} filterInfos - Filter info tree structure
   * @param {Array} aggregation - Aggregation results from Elasticsearch
   */
  static aggregateFilterInfos(filterInfos, aggregation) {
    Aggregator.traverse(filterInfos, Aggregator.enrichDocCounts, {
      esAggregation: aggregation,
    });
  }

  /**
   * Enrich a single filter value with document count and availability
   * Called by traverse for each filter value
   * @param {Object} value - Filter value object to enrich
   * @param {Object} data - Data object containing ES aggregation
   * @param {Array} data.esAggregation - Elasticsearch aggregation results
   */
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

  /**
   * Recursively traverse a filter tree structure
   * Applies a function to each node in the tree
   * @param {Object} obj - Object or array to traverse
   * @param {Function} func - Function to apply to each value
   * @param {Object} data - Data to pass to the function
   */
  static traverse(obj, func, data) {
    Object.values(obj).forEach((value) => {
      func(value, data);

      const { children } = value || {};
      if (Array.isArray(children)) {
        Aggregator.traverse(value.children, func, data);
      }
    });
  }

  /**
   * Aggregate all filters from Elasticsearch responses
   * Combines unfiltered, filtered, and multi-filter aggregations
   * @param {Object} params - Parameters for filter aggregation
   * @param {Object} params.esResult - Full Elasticsearch result with all responses
   * @param {Object} params.mappings - Mappings object
   * @param {Object} params.queryBuilder - Query builder instance to get multi filters
   * @param {string} params.language - Language code
   * @returns {Object} Aggregated filters
   */
  static aggregateAllFilters(params) {
    const { esResult, mappings, queryBuilder, language } = params;
    
    // Get internal resources
    const filterInfos = Aggregator.getFilterInfos();
    const translations = Aggregator.getTranslations();

    // Aggregate unfiltered filter buckets
    let aggregationsAll = Aggregator.aggregateESFilterBuckets({
      aggregations: esResult.body.responses[0].aggregations,
      setAsAvailable: false,
      allFilters: true,
      mappings,
    });

    // Aggregate filtered filter buckets
    const aggregationsFiltered = Aggregator.aggregateESFilterBuckets({
      aggregations: esResult.body.responses[1].aggregations,
      setAsAvailable: true,
      mappings,
    });

    // Aggregate filter buckets of multi filters
    const mustMultiFilters = queryBuilder.getMustMultiFilters();

    const agregationsMultiFilter = {};
    Object.keys(mustMultiFilters).forEach((searchParamsMultiFilter, currentIndex) => {
      const currentAggregation = Aggregator.aggregateESFilterBuckets({
        aggregations: esResult.body.responses[currentIndex + 2].aggregations,
        setAsAvailable: true,
        mappings,
      });

      const filterKey = searchParamsMultiFilter.key;
      agregationsMultiFilter[filterKey] = currentAggregation[filterKey];
    });

    const aggregationKeys = Object.keys(aggregationsAll);

    // Merge all and available filters
    aggregationKeys.forEach((aggregationKey) => {
      const currentAggregationAll = aggregationsAll[aggregationKey];
      const currentAggregationFiltered = aggregationsFiltered[aggregationKey];
      const filterInfosClone = JSON.parse(JSON.stringify(filterInfos[language]));

      // Aggregate filterInfos filter
      if (mappings.isFilterInfosFilter(aggregationKey)) {
        const currentFilterInfos = filterInfosClone.find(
          (filter) => filter.id === aggregationKey,
        );
        Aggregator.aggregateFilterInfos(currentFilterInfos.children, currentAggregationFiltered);
        aggregationsAll[aggregationKey] = {
          display_value: currentFilterInfos.text,
          value: currentFilterInfos.children,
        };

        // Aggregate other filters
      } else {
        currentAggregationFiltered.forEach((aggregationFiltered) => {
          const indexOfAggregation = currentAggregationAll.findIndex((aggregationAll) => {
            return aggregationAll.display_value === aggregationFiltered.display_value;
          });
          if (indexOfAggregation > -1) {
            aggregationsAll[aggregationKey][indexOfAggregation].is_available = true;
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
      const translationKey = translations.getTranslation(aggregationKey, language)
        || aggregationKey;
      aggregationsAll[aggregationKey] = {
        display_value: aggregationsAll[aggregationKey].display_value
          || translationKey
          || aggregationKey,
        values: aggregationsAll[aggregationKey].value || aggregationData,
      };
    });

    return aggregationsAll;
  }
}

module.exports = Aggregator;
