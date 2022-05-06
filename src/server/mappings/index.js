const mappings = [

  /*
  Documentation of the fields from the mappings
  {
    display_value: <string>
    Value to be displayed in the frontend,

    key: <string>
    Value under which the filters are grouped

    showAsResult: <boolean>
    Indicates if this field will be outputted as result item

    showAsFilter: <boolean>
    Indicates if this field will be outputted as filter

    searchTermField: <boolean>
    Indicates if this field is considered in filtering by searchterm

    value: <string>
    Value that can be filtered by (This value is language independent)

    filter_types: Array<string>
    For this group allowed filter types.
    Possible values: 'equals', 'notequals', 'range', 'notrange'

  }
  // */
  // // Zuschreibung
  // {
  //   display_value: 'involvedPersons.name.keyword',
  //   key: 'attribution',
  //   showAsFilter: true,
  //   showAsResult: false,
  //   value: 'involvedPersons.id.keyword',
  //   filter_types: ['equals', 'notequals'],
  //   filterInfos: true,
  // },

  // Zuschreibung
  {
    display_value: 'filterInfos.attribution.id',
    showAsFilter: true,
    showAsResult: true,
    filter_types: ['equals', 'notequals'],
    key: 'attribution',
    value: 'filterInfos.attribution.id',
    nestedPath: 'filterInfos.attribution',
    sortBy: 'filterInfos.attribution.order',
    filterInfos: true,
    searchTermField: true,
  },

  // Zuschreibung (Array)
  {
    display_value: 'involvedPersons',
    filter_types: ['equals', 'notequals'],
    key: 'involved_persons',
    value: 'involvedPersons',
    showAsResult: true,
  },

  // Standort
  {
    display_value: 'location',
    filter_types: ['equals', 'notequals', 'similar'],
    key: 'repository',
    value: 'repository',
    showAsResult: false,
    searchTermField: true,
  },

  // Medium
  {
    display_value: 'medium',
    filter_types: [],
    key: 'medium',
    value: 'medium',
    showAsResult: true,
    searchTermField: true,
  },

  // Sammlung / Standort
  {
    display_value: 'filterInfos.collection_repository.id',
    key: 'collection_repository',
    showAsFilter: true,
    showAsResult: false,
    value: 'filterInfos.collection_repository.id',
    nestedPath: 'filterInfos.collection_repository',
    filter_types: ['equals', 'notequals', 'similar'],
    filterInfos: true,
  },

  // Untersuchungstechniken
  {
    display_value: 'filterInfos.examination_analysis.id',
    key: 'examination_analysis',
    showAsFilter: true,
    showAsResult: false,
    value: 'filterInfos.examination_analysis.id',
    nestedPath: 'filterInfos.examination_analysis',
    filter_types: ['equals', 'notequals'],
    filterInfos: true,
  },

  // Katalog
  {
    display_value: 'filterInfos.catalog.id',
    key: 'catalog',
    showAsFilter: true,
    showAsResult: false,
    value: 'filterInfos.catalog.id',
    nestedPath: 'filterInfos.catalog',
    filter_types: ['equals', 'notequals'],
    filterInfos: true,
  },

  // Die 100 besten Werke
  {
    display_value: 'isBestOf',
    filter_types: ['equals', 'notequals'],
    key: 'is_best_of',
    showAsFilter: true,
    value: 'isBestOf',
    showAsResult: true,

  },

  // Image
  {
    display_value: 'metadata.imgSrc.keyword',
    showAsResult: true,
    filter_types: [],
    key: 'img_src',
    value: 'metadata.imgSrc.keyword',
  },

  // Datierung
  {
    display_value: 'metadata.date',
    showAsFilter: false,
    showAsResult: true,
    sortable: true,
    filter_types: [],
    key: 'dating',
    value: 'metadata.date.keyword',
  },

  // Datierung Beginn
  {
    display_value: 'dating.begin',
    showAsFilter: true,
    showAsResult: true,
    filter_types: ['equals', 'notequals', 'range', 'notrange', 'multiequals'],
    key: 'dating_begin',
    value: 'dating.begin',
  },

  // Datierung Ende
  {
    display_value: 'dating.end',
    showAsFilter: true,
    showAsResult: true,
    sortable: true,
    filter_types: ['equals', 'notequals', 'range', 'notrange', 'multiequals'],
    key: 'dating_end',
    value: 'dating.end',
  },

  // Entitäts typ
  {
    display_value: 'metadata.entityType.keyword',
    key: 'entity_type',
    showAsFilter: true,
    showAsResult: true,
    value: 'metadata.entityType.keyword',
    filter_types: ['equals', 'notequals'],
  },

  // Description
  {
    display_value: 'description.keyword',
    showAsFilter: false,
    showAsResult: false,
    sortable: false,
    filter_types: [],
    key: 'description',
    value: 'description.keyword',
    searchTermField: true,
  },

  // Dimensionen
  {
    display_value: 'dimensions',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'dimensions',
    value: 'dimensions',
  },

  // Form
  {
    display_value: 'filterInfos.form.id.keyword',
    key: 'form',
    showAsFilter: true,
    showAsResult: false,
    value: 'filterInfos.form.id.keyword',
    filter_types: ['equals', 'notequals'],
    filterInfos: true,
  },

  // Funktion
  {
    display_value: 'filterInfos.function.id.keyword',
    key: 'function',
    showAsFilter: true,
    showAsResult: false,
    value: 'filterInfos.function.id.keyword',
    filter_types: ['equals', 'notequals'],
    filterInfos: true,
  },

  // Bestandteile
  {
    display_value: 'filterInfos.component_parts.id.keyword',
    key: 'component_parts',
    showAsFilter: true,
    showAsResult: false,
    value: 'filterInfos.component_parts.id.keyword',
    filter_types: ['equals', 'notequals'],
    filterInfos: true,
  },

  // Technik
  {
    display_value: 'filterInfos.technique.id.keyword',
    key: 'technique',
    showAsFilter: true,
    showAsResult: false,
    value: 'filterInfos.technique.id.keyword',
    filter_types: ['equals', 'notequals'],
    filterInfos: true,
  },

  // Abbildungen
  {
    display_value: 'images',
    showAsFilter: false,
    showAsResult: false,
    filter_types: [],
    key: 'images',
    value: 'images',
  },

  // Inventarnummer
  {
    display_value: 'inventoryNumber.keyword',
    showAsFilter: false,
    showAsResult: true,
    filter_types: ['equals', 'notequals', 'similar'],
    key: 'inventory_number',
    value: 'inventoryNumber.keyword',
  },

  // Object name
  {
    display_value: 'objectName.keyword',
    showAsFilter: true,
    showAsResult: true,
    filter_types: ['equals', 'notequals', 'similar'],
    key: 'object_name',
    value: 'objectName.keyword',
  },

  // Eigentümer
  {
    display_value: 'owner',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'owner',
    value: 'owner',
    searchTermField: true,
  },

  // Klassifizierung
  {
    display_value: 'classification.classification',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'classification',
    value: 'classification.classification',
  },

  // Print Process
  {
    display_value: 'classification.printProcess',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'print_process',
    value: 'classification.printProcess',
  },

  // Inhalt
  {
    display_value: 'filterInfos.subject.id',
    key: 'subject',
    showAsFilter: true,
    showAsResult: false,
    value: 'filterInfos.subject.id',
    nestedPath: 'filterInfos.subject',
    filter_types: ['equals', 'notequals'],
    filterInfos: true,
  },

  // Titel
  {
    display_value: 'metadata.title.keyword',
    showAsFilter: true,
    showAsResult: true,
    filter_types: ['equals', 'notequals', 'similar'],
    key: 'title',
    value: 'metadata.title.keyword',
    searchTermField: true,
  },

  // Dimension - Breite
  {
    display_value: 'images.overall.infos.maxDimensions.width',
    key: 'size_width',
    showAsFilter: true,
    showAsResult: false,
    value: 'images.overall.infos.maxDimensions.width',
    filter_types: ['equals', 'notequals', 'range', 'notrange'],
  },

  // Dimension - Höhe
  {
    display_value: 'images.overall.infos.maxDimensions.height',
    key: 'size_height',
    showAsFilter: true,
    showAsResult: false,
    value: 'images.overall.infos.maxDimensions.height',
    filter_types: ['equals', 'notequals', 'range', 'notrange'],
  },

  // Untertitel
  {
    display_value: 'metadata.subtitle',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'subtitle',
    value: 'metadata.subtitle',
    searchTermField: true,
  },

  // Sorting Number
  {
    display_value: 'sortingNumber.keyword',
    showAsFilter: false,
    showAsResult: true,
    sortable: true,
    filter_types: ['equals', 'notequals'],
    key: 'sorting_number',
    value: 'sortingNumber.keyword',
  },

  // Sorting Info Position
  {
    display_value: 'sortingInfo.position',
    showAsFilter: false,
    showAsResult: false,
    sortable: true,
    filter_types: [],
    key: 'sorting_info_position',
    value: 'sortingInfo.position',
  },

  // Sorting Info Year
  {
    display_value: 'sortingInfo.year',
    showAsFilter: false,
    showAsResult: false,
    sortable: true,
    filter_types: [],
    key: 'sorting_info_year',
    value: 'sortingInfo.year',
  },

  // Score
  {
    display_value: '_score',
    showAsFilter: false,
    showAsResult: false,
    sortable: true,
    filter_types: [],
    key: 'score',
    value: '_score',
  },


  // Catalog Work Reference
  {
    display_value: 'catalogWorkReferences.description',
    showAsFilter: true,
    showAsResult: false,
    filter_types: ['equals', 'notequals', 'similar'],
    key: 'catalog_name',
    value: 'catalogWorkReferences.description',
    nestedPath: 'catalogWorkReferences',
  },

  // Catalog Work Reference Number
  {
    display_value: 'catalogWorkReferences.referenceNumber',
    showAsFilter: true,
    showAsResult: false,
    filter_types: ['equals', 'notequals', 'similar'],
    key: 'catalog_work_reference_number',
    value: 'catalogWorkReferences.referenceNumber',
    nestedPath: 'catalogWorkReferences',
  },
];

const specialParams = ['size', 'from', 'sort_by', 'language', 'searchterm', 'show_data_all'];

const availableFilterTypes = {
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

const defaultFilterType = 'eq';
const defaultSortFieldKeys = ['sorting_info_year', 'sorting_info_position'];
const defaultResponseSize = 100;

const availableSortTypes = {
  asc: 'ascending',
  desc: 'descending',
};

const defautSortDirection = 'asc';

function isFilterInfosFilter(filterKey) {
  const index = mappings.findIndex((mapping) => mapping.key === filterKey
    && mapping.filterInfos
    && mapping.filterInfos === true);
  return index > -1;
}

function isNestedFilter(filterkey) {
  const index = mappings.findIndex((mapping) => mapping.key === filterkey
    && mapping.nestedPath);
  return index > -1;
}

function getMappingByKey(key) {
  return mappings.find((mapping) => mapping.key === key);
}

function getAllowedFilters() {
  return mappings.filter((mapping) => mapping.filter_types.length > 0);
}

function getSortableFields() {
  return mappings.filter((mapping) => mapping.sortable === true);
}

function getVisibleFilters() {
  return mappings.filter((mapping) => mapping.showAsFilter === true);
}

function getSearchTermFields() {
  return mappings.filter((mapping) => mapping.searchTermField === true);
}

function getVisibleResults() {
  const filteredMappings = mappings.filter((mapping) => mapping.showAsResult === true);
  const ret = filteredMappings.map((mapping) => {
    const currentMapping = { ...mapping };
    currentMapping.display_value = mapping.display_value.replace(/\.keyword$/, '');
    return currentMapping;
  });
  return ret;
}

function getDefaultSortFields() {
  return defaultSortFieldKeys.map(
    (defaultSortFieldKey) => mappings.find(mapping => mapping.key === defaultSortFieldKey),
  );
}

module.exports = {
  availableFilterTypes,
  availableSortTypes,
  defaultFilterType,
  defaultResponseSize,
  getDefaultSortFields,
  defautSortDirection,
  mappings,
  specialParams,
  isFilterInfosFilter,
  isNestedFilter,
  getAllowedFilters,
  getMappingByKey,
  getSearchTermFields,
  getSortableFields,
  getVisibleFilters,
  getVisibleResults,
};
