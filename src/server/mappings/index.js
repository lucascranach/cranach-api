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

  // {
  //   display_value: 'thesaurus.term.keyword',
  //   filter: true,
  //   filter_types: ['equals', 'notequals'],
  //   key: 'thesaurus',
  //   value: 'thesaurus.parentId.keyword',
  // },

  {
    display_value: 'classification.classification.keyword',
    key: 'classification',
    filter: true,
    value: 'classification.classification.keyword',
    filter_types: ['equals', 'notequals'],
  },
  {
    display_value: 'images.representative.infos.maxDimensions.width',
    key: 'size_width',
    filter: true,
    value: 'images.representative.infos.maxDimensions.width',
    filter_types: ['equals', 'notequals', 'range', 'notrange'],
  },
  {
    display_value: 'images.representative.infos.maxDimensions.height',
    key: 'size_height',
    filter: true,
    value: 'images.representative.infos.maxDimensions.height',
    filter_types: ['equals', 'notequals', 'range', 'notrange'],
  },
  {
    display_value: 'entityType.keyword',
    key: 'entity_type',
    filter: true,
    value: 'entityType.keyword',
    filter_types: ['equals', 'notequals'],
  },
];

const specialParams = ['size', 'from'];

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

module.exports = { mappings, availableFilterTypes, specialParams };
