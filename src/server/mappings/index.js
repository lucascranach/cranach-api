const mappings = [

  // Zuschreibung
  // "Bekannte Meister der Cranach Werkstatt" nicht in Daten enthalten
  {
    display_value: 'involvedPersons.name.keyword',
    filter: true,
    filter_types: ['equals', 'notequals'],
    key: 'involved_persons',
    value: 'involvedPersons.name.keyword',
  },

  // Datierung
  {
    display_value: 'dating.begin',
    filter: true,
    filter_types: ['equals', 'notequals', 'range', 'notrange'],
    key: 'dating_begin',
    value: 'dating.begin',
  },

  // Datierung
  {
    display_value: 'dating.end',
    filter: true,
    sortable: true,
    filter_types: ['equals', 'notequals', 'range', 'notrange'],
    key: 'dating_end',
    value: 'dating.end',
  },

  // Standort
  // Bisher kann nur der Ort aggregiet werden, da das Land
  // nur in einem zusammenhängenden String gespeichert wird
  // locations -> path: "Schweiz > cantons > Zürich > inhabited places > Winterthur"
  // Privatsammlung, Unbekannter Standort, Verlust nicht in den Daten gespeichert
  {
    display_value: 'locations.term.keyword',
    filter: true,
    filter_types: ['equals', 'notequals'],
    key: 'location',
    value: 'locations.term.keyword',
  },

  // Untersuchungstechniken
  // Mischung von deutschen und englischen Begriffen
  // Infrarot Reflektographie - Infrared reflectography
  {
    display_value: 'restorationSurveys.tests.keywords.name.keyword',
    filter: true,
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
    filter: true,
    value: 'thesaurus.id.keyword',
    filter_types: ['equals', 'notequals'],
    thesaurus: true,
  },

  {
    display_value: 'classification.classification.keyword',
    key: 'classification',
    filter: true,
    value: 'classification.classification.keyword',
    filter_types: ['equals', 'notequals'],
  },
  {
    display_value: 'images.overall.infos.maxDimensions.width',
    key: 'size_width',
    filter: true,
    value: 'images.overall.infos.maxDimensions.width',
    filter_types: ['equals', 'notequals', 'range', 'notrange'],
  },

  {
    display_value: 'images.overall.infos.maxDimensions.height',
    key: 'size_height',
    filter: true,
    value: 'images.overall.infos.maxDimensions.height',
    filter_types: ['equals', 'notequals', 'range', 'notrange'],
  },

  {
    display_value: '_id',
    key: 'id',
    filter: true,
    value: '_id',
    filter_types: ['equals', 'notequals'],
  },

  {
    display_value: 'metadata.entityType.keyword',
    key: 'entity_type',
    filter: true,
    value: 'metadata.entityType.keyword',
    filter_types: ['equals', 'notequals'],
  },

  // Sorting Number
  {
    display_value: 'sortingNumber.keyword',
    filter: false,
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
  return mappings.filter((mapping) => mapping.filter === true);
}

function getSortableFields() {
  return mappings.filter((mapping) => mapping.sortable === true);
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
};
