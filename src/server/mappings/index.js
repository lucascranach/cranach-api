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
  */
  // Zuschreibung
  {
    display_value: 'filterInfos.attribution.id.keyword',
    key: 'attribution',
    showAsFilter: true,
    showAsResult: false,
    value: 'filterInfos.attribution.id.keyword',
    filter_types: ['equals', 'notequals'],
    filterInfos: true,
  },

  {
    display_value: 'classification.classification.keyword',
    key: 'classification',
    showAsFilter: true,
    showAsResult: true,
    value: 'classification.classification.keyword',
    filter_types: ['equals', 'notequals'],
    searchTermField: true,
  },

  // Sammlung / Standort
  {
    display_value: 'filterInfos.collection_repository.id.keyword',
    key: 'collection_repository',
    showAsFilter: true,
    showAsResult: false,
    value: 'filterInfos.collection_repository.id.keyword',
    filter_types: ['equals', 'notequals'],
    filterInfos: true,
  },

  // Untersuchungstechniken
  {
    display_value: 'filterInfos.examination_analysis.id.keyword',
    key: 'examination_analysis',
    showAsFilter: true,
    showAsResult: false,
    value: 'filterInfos.examination_analysis.id.keyword',
    filter_types: ['equals', 'notequals'],
    filterInfos: true,
  },

  // Zuschreibung
  // "Bekannte Meister der Cranach Werkstatt" nicht in Daten enthalten
  {
    display_value: 'involvedPersons.name',
    showAsFilter: true,
    showAsResult: false,
    filter_types: ['equals', 'notequals'],
    key: 'involved_persons',
    value: 'involvedPersons.name',
    nestedPath: 'involvedPersons',
    sortBy: 'involvedPersons.displayOrder',
  },

  // Die 100 besten Werke
  {
    display_value: 'isBestOf',
    filter: true,
    filter_types: ['equals', 'notequals'],
    key: 'is_best_of',
    value: 'isBestOf',
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
    showAsResult: false,
    filter_types: ['equals', 'notequals', 'range', 'notrange'],
    key: 'dating_begin',
    value: 'dating.begin',
  },

  // Datierung Ende
  {
    display_value: 'dating.end',
    showAsFilter: true,
    showAsResult: false,
    sortable: true,
    filter_types: ['equals', 'notequals', 'range', 'notrange'],
    key: 'dating_end',
    value: 'dating.end',
  },

  {
    display_value: 'metadata.entityType.keyword',
    key: 'entity_type',
    showAsFilter: true,
    showAsResult: true,
    value: 'metadata.entityType.keyword',
    filter_types: ['equals', 'notequals'],
  },

  // Datierung Ende
  {
    display_value: 'description.keyword',
    showAsFilter: false,
    showAsResult: true,
    sortable: false,
    filter_types: [],
    key: 'description',
    value: 'description.keyword',
    searchTermField: true,
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

  {
    display_value: 'images',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'images',
    value: 'images',
  },

  {
    display_value: 'reprints',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'reprints',
    value: 'references.reprints',
  },

  {
    display_value: 'inventoryNumber.keyword',
    key: 'inventory_number',
    showAsFilter: true,
    showAsResult: true,
    filter_types: ['equals', 'notequals'],
    value: 'inventoryNumber.keyword',
  },

  // Standort
  // Bisher kann nur der Ort aggregiert werden, da das Land
  // nur in einem zusammenhängenden String gespeichert wird
  // locations -> path: "Schweiz > cantons > Zürich > inhabited places > Winterthur"
  // Privatsammlung, Unbekannter Standort, Verlust nicht in den Daten gespeichert
  {
    display_value: 'locations.term.keyword',
    showAsFilter: true,
    showAsResult: false,
    filter_types: ['equals', 'notequals', 'multiequals'],
    key: 'location',
    value: 'locations.term.keyword',
  },

  {
    display_value: 'owner',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'owner',
    value: 'owner',
  },

  // Subject
  {
    display_value: 'filterInfos.subject.id.keyword',
    key: 'subject',
    showAsFilter: true,
    showAsResult: false,
    value: 'filterInfos.subject.id.keyword',
    filter_types: ['equals', 'notequals'],
    filterInfos: true,
  },

  // Untersuchungstechniken
  // Mischung von deutschen und englischen Begriffen
  // Infrarot Reflektographie - Infrared reflectography
  {
    display_value: 'restorationSurveys.tests.keywords.name.keyword',
    showAsFilter: true,
    showAsResult: false,
    filter_types: ['equals', 'notequals'],
    key: 'subtitling_techniques',
    value: 'restorationSurveys.tests.keywords.name.keyword',
  },

  {
    display_value: 'metadata.title',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'title',
    value: 'metadata.title',
    searchTermField: true,
  },

  {
    display_value: 'images.overall.infos.maxDimensions.width',
    key: 'size_width',
    showAsFilter: true,
    showAsResult: false,
    value: 'images.overall.infos.maxDimensions.width',
    filter_types: ['equals', 'notequals', 'range', 'notrange'],
  },

  {
    display_value: 'images.overall.infos.maxDimensions.height',
    key: 'size_height',
    showAsFilter: true,
    showAsResult: false,
    value: 'images.overall.infos.maxDimensions.height',
    filter_types: ['equals', 'notequals', 'range', 'notrange'],
  },

  {
    display_value: 'metadata.subtitle',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'subtitle',
    value: 'metadata.subtitle',
    searchTermField: true,
  },

  {
    display_value: 'objectId',
    key: 'object_id',
    showAsFilter: false,
    showAsResult: true,
    value: 'objectId',
    filter_types: [],
  },

  {
    display_value: 'objectName.keyword',
    key: 'object_name',
    showAsFilter: false,
    showAsResult: true,
    value: 'objectName.keyword',
    filter_types: [],
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
];

const specialParams = ['size', 'from', 'sort_by', 'language', 'searchterm'];

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
};

const defaultFilterType = 'eq';
const defaultSortFieldKey = 'sorting_number';

const availableSortTypes = {
  asc: 'ascending',
  desc: 'descending',
};

const defautSortDirection = 'desc';

function isFilterInfosFilter(filterKey) {
  const index = mappings.findIndex((element) => element.key === filterKey
  && element.filterInfos
  && element.filterInfos === true);
  return index > -1;
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

function getFilterByKey(filterKey) {
  return mappings.filter((mapping) => mapping.key === filterKey);
}

function getDefaultSortField() {
  return mappings.find((mapping) => mapping.key === defaultSortFieldKey);
}

module.exports = {
  availableFilterTypes,
  availableSortTypes,
  defaultFilterType,
  getDefaultSortField,
  defautSortDirection,
  mappings,
  specialParams,
  isFilterInfosFilter,
  getFilterByKey,
  getAllowedFilters,
  getSearchTermFields,
  getSortableFields,
  getVisibleFilters,
  getVisibleResults,
};
