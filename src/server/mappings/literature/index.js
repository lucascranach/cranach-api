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

  // Entitäts typ
  {
    display_value: 'metadata.entityType.keyword',
    key: 'entity_type',
    showAsFilter: true,
    showAsResult: true,
    value: 'metadata.entityType.keyword',
    filter_types: ['equals', 'notequals'],
  },

  // Reference-ID
  {
    display_value: 'referenceId',
    showAsFilter: false,
    showAsResult: true,
    sortable: true,
    filter_types: ['equals', 'notequals'],
    key: 'reference_id',
    value: 'referenceId',
    searchTermField: true,
  },

  // Reference number
  {
    display_value: 'referenceNumber.keyword',
    showAsFilter: false,
    showAsResult: true,
    sortable: true,
    filter_types: ['equals', 'notequals', 'similar'],
    key: 'reference_number',
    value: 'referenceNumber.keyword',
    searchTermField: true,
  },

  // Primary-Source
  {
    display_value: 'isPrimarySource',
    showAsFilter: false,
    showAsResult: true,
    sortable: true,
    filter_types: ['equals', 'notequals'],
    key: 'is_primary_source',
    value: 'isPrimarySource',
  },

  // Titel
  {
    display_value: 'metadata.title.keyword',
    showAsFilter: false,
    showAsResult: true,
    sortable: true,
    filter_types: ['equals', 'notequals', 'similar'],
    key: 'title',
    value: 'metadata.title.keyword',
    searchTermField: true,
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

  // Short title
  {
    display_value: 'shortTitle',
    showAsFilter: false,
    showAsResult: true,
    filter_types: ['equals', 'notequals'],
    key: 'short_title',
    value: 'shortTitle',
    searchTermField: true,
  },

  // Longt title
  {
    display_value: 'longTitle',
    showAsFilter: false,
    showAsResult: true,
    filter_types: ['equals', 'notequals'],
    key: 'long_title',
    value: 'longTitle',
    searchTermField: true,
  },

  // Journal
  {
    display_value: 'journal',
    showAsFilter: false,
    showAsResult: true,
    filter_types: ['equals', 'notequals'],
    key: 'journal',
    value: 'journal',
    searchTermField: true,
  },

  // Series
  {
    display_value: 'series',
    showAsFilter: false,
    showAsResult: true,
    filter_types: ['equals', 'notequals'],
    key: 'series',
    value: 'series',
  },

  // Volume
  {
    display_value: 'volume',
    showAsFilter: false,
    showAsResult: true,
    filter_types: ['equals', 'notequals'],
    key: 'volume',
    value: 'volume',
  },

  // Edition
  {
    display_value: 'edition',
    showAsFilter: false,
    showAsResult: true,
    filter_types: ['equals', 'notequals'],
    key: 'edition',
    value: 'edition',
  },

  // Publish location
  {
    display_value: 'publishLocation.keyword',
    showAsFilter: false,
    showAsResult: true,
    sortable: true,
    filter_types: ['equals', 'notequals'],
    key: 'publish_location',
    value: 'publishLocation.keyword',
    searchTermField: true,
  },

  // Publish date
  {
    display_value: 'publishDate.keyword',
    showAsFilter: false,
    showAsResult: true,
    sortable: true,
    filter_types: ['equals', 'notequals', 'similar'],
    key: 'publish_date',
    value: 'publishDate.keyword',
    searchTermField: true,
  },

  // Page numbers
  {
    display_value: 'pageNumbers',
    showAsFilter: false,
    showAsResult: true,
    filter_types: ['equals', 'notequals'],
    key: 'page_numbers',
    value: 'pageNumbers',
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

  // Events?
  {
    display_value: 'events',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'events',
    value: 'events',
  },

  // Copyright
  {
    display_value: 'copyright',
    showAsFilter: false,
    showAsResult: true,
    filter_types: ['equals', 'notequals'],
    key: 'copyright',
    value: 'copyright',
  },

  // Persons
  {
    display_value: 'persons',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'persons',
    value: 'persons',
  },

  // Authors
  {
    display_value: 'authors.keyword',
    showAsFilter: false,
    showAsResult: true,
    sortable: true,
    filter_types: ['similar'],
    key: 'authors',
    value: 'authors.keyword',
    searchTermField: true,
  },

  // Publications line
  {
    display_value: 'publicationsLine',
    showAsFilter: false,
    showAsResult: true,
    sortable: true,
    filter_types: [],
    key: 'publications_line',
    value: 'publicationsLine.keyword',
  },

  // Publication text
  {
    display_value: 'publications.text',
    showAsFilter: true,
    showAsResult: false,
    filter_types: ['equals', 'notequals', 'similar'],
    key: 'publication_text',
    value: 'publications.text',
    nestedPath: 'publications',
    searchTermField: true,
  },

  // Publications types / media types
  {
    display_value: 'publications.text',
    showAsFilter: true,
    showAsResult: false,
    filter_types: ['equals'],
    key: 'media_type',
    value: 'publications.type',
    nestedPath: 'publications',
  },

  // Alternate numbers
  {
    display_value: 'alternateNumbers',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'alternate_numbers',
    value: 'alternateNumbers',
  },

  // Physical description
  {
    display_value: 'physicalDescription',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'physical_description',
    value: 'physicalDescription',
  },

  // Mention
  {
    display_value: 'mention',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'mention',
    value: 'mention',
  },

  // Connected objects
  {
    display_value: 'connectedObjects',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'connected_objects',
    value: 'connectedObjects',
  },

  // Sorting Number
  // To be reactivated on existing 'sortingNumber' field
  // {
  //   display_value: 'sortingNumber.keyword',
  //   showAsFilter: false,
  //   showAsResult: true,
  //   sortable: true,
  //   filter_types: ['equals', 'notequals'],
  //   key: 'sorting_number',
  //   value: 'sortingNumber.keyword',
  // },

  // Search sortingnumber
  // TODO: 'searchSortingNumber' field does not exist yet,
  //   but mapping is currently needed because of it beeing used as default sorting field
  {
    display_value: 'searchSortingNumber.keyword',
    showAsFilter: false,
    showAsResult: true,
    sortable: true,
    filter_types: [],
    key: 'search_sorting_number',
    value: 'searchSortingNumber.keyword',
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
];

const entityTypes = ['LITERATURE_REFERENCE'];

module.exports = {
  mappings,
  entityTypes,
};
