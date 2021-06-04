const mappings = [

  /*
  Documentation of the fields from the mappings
  {
    display_value: <string>
    Value to be displayed in the frontend,

    showAsFilter: <string>
    Indicates if this value can be used as a filter

    filter_types: Array<string>
    For this group allowed filter types.
    Possible values: 'equals', 'notequals', 'range', 'notrange'

    key: <string>
    Value under which the filters are grouped

    value: <string>
    Value that can be filtered by (This value is language independent)
  }
  */
  {
    display_value: 'classification.classification.keyword',
    key: 'classification',
    showAsFilter: true,
    showAsResult: true,
    value: 'classification.classification.keyword',
    filter_types: ['equals', 'notequals'],
  },

  // Zuschreibung
  // "Bekannte Meister der Cranach Werkstatt" nicht in Daten enthalten
  {
    display_value: 'involvedPersons.name.keyword',
    showAsFilter: true,
    showAsResult: false,
    filter_types: ['equals', 'notequals'],
    key: 'involved_persons',
    value: 'involvedPersons.name.keyword',
  },

  // Datierung
  {
    display_value: 'metadata.date',
    showAsFilter: false,
    showAsResult: true,
    sortable: true,
    filter_types: [],
    key: 'dating',
    value: 'metadata.date',
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
    display_value: 'images',
    showAsFilter: false,
    showAsResult: false,
    filter_types: [],
    key: 'images',
    value: 'images',
  },

  // Standort
  // Bisher kann nur der Ort aggregiet werden, da das Land
  // nur in einem zusammenhängenden String gespeichert wird
  // locations -> path: "Schweiz > cantons > Zürich > inhabited places > Winterthur"
  // Privatsammlung, Unbekannter Standort, Verlust nicht in den Daten gespeichert
  {
    display_value: 'locations.term.keyword',
    showAsFilter: true,
    showAsResult: false,
    filter_types: ['equals', 'notequals'],
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

  // Form, Funktion und Bestandteile
  // Daten sind in keywords und the keywrods vorhanden.
  // Datenbasis ist allerdings nicht verwertbar

  {
    display_value: 'thesaurus.id.keyword',
    key: 'thesaurus',
    showAsFilter: true,
    showAsResult: false,
    value: 'thesaurus.id.keyword',
    filter_types: ['equals', 'notequals'],
    thesaurus: true,
  },

  {
    display_value: 'metadata.title',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'title',
    value: 'metadata.title',
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
  },

  {
    display_value: '_id',
    key: 'id',
    showAsFilter: false,
    value: '_id',
    filter_types: ['equals', 'notequals'],
  },

  {
    display_value: 'metadata.entityType.keyword',
    key: 'entity_type',
    showAsFilter: true,
    showAsResult: false,
    value: 'metadata.entityType.keyword',
    filter_types: ['equals', 'notequals'],
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

const specialParams = ['size', 'from', 'sort_by'];

const availableFilterTypes = {
  eq: 'equals',
  neq: 'notequals',
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

function isThesaurusFilter(filterKey) {
  const index = mappings.findIndex((element) => element.key === filterKey
  && element.thesaurus
  && element.thesaurus === true);
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

function getVisibleResults() {
  const filteredMappings = mappings.filter((mapping) => mapping.showAsResult === true);
  const ret = filteredMappings.map((mapping) => {
    const currentMapping = { ...mapping };
    currentMapping.display_value = mapping.display_value.replace(/\.keyword$/, '');
    return currentMapping;
  });
  return ret;
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
  isThesaurusFilter,
  getAllowedFilters,
  getSortableFields,
  getVisibleFilters,
  getVisibleResults,
};
