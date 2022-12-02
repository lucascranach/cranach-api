
const MappingType = {
  WORKS: 'works',
  ARCHIVALS: 'archivals',
};

class Mappings {
  static specialParams = ['size', 'from', 'sort_by', 'language', 'searchterm', 'show_data_all'];

  static availableFilterTypes = {
    eq: 'equals',
    neq: 'notequals',
    meq: 'multiequals',
    gt: 'range',
    gte: 'range',
    lt: 'range',
    lte: 'range',
    ngt: 'notrange',
    ngte: 'notrange',
    nlt: 'notrange',
    nlte: 'notrange',
    sim: 'similar',
  };

  static defaultFilterType = 'eq';
  static defaultSortFieldKeys = ['search_sorting_number'];
  static defaultResponseSize = 100;

  static availableSortTypes = {
    asc: 'ascending',
    desc: 'descending',
  };

  static defautSortDirection = 'asc';

  constructor(type) {
    if (!(Object.values(MappingType).includes(type))) {
      throw new Error(`Unsupported mapping type: ${type}`);
    }

    const { mappings, entityTypes } = require(`./${type}/index.js`);
    this.mappings = mappings;
    this.entityTypes = entityTypes;
  }

  isFilterInfosFilter(filterKey) {
    const index = this.mappings.findIndex((mapping) => mapping.key === filterKey
      && mapping.filterInfos
      && mapping.filterInfos === true);
    return index > -1;
  }

  isNestedFilter(filterkey) {
    const index = this.mappings.findIndex((mapping) => mapping.key === filterkey
      && mapping.nestedPath);
    return index > -1;
  }

  getMappingByKey(key) {
    return this.mappings.find((mapping) => mapping.key === key);
  }

  getAllowedFilters() {
    return this.mappings.filter((mapping) => mapping.filter_types.length > 0);
  }

  getSortableFields() {
    return this.mappings.filter((mapping) => mapping.sortable === true);
  }

  getVisibleFilters() {
    return this.mappings.filter((mapping) => mapping.showAsFilter === true);
  }

  getSearchTermFields() {
    return this.mappings.filter((mapping) => mapping.searchTermField === true);
  }

  getVisibleResults() {
    const filteredMappings = this.mappings.filter((mapping) => mapping.showAsResult === true);
    const ret = filteredMappings.map((mapping) => {
      const currentMapping = { ...mapping };
      currentMapping.display_value = mapping.display_value.replace(/\.keyword$/, '');
      return currentMapping;
    });
    return ret;
  }

  getDefaultSortFields() {
    return Mappings.defaultSortFieldKeys.map(
      (defaultSortFieldKey) => this.mappings.find(mapping => mapping.key === defaultSortFieldKey),
    );
  }

  getEntityTypes() {
    return this.entityTypes;
  }
}

module.exports = {
  Mappings,
  MappingType,
};
