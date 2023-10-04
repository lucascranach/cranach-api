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
    searchTermField: true,
  },

  // Institutionen (rein für die Suche)
  {
    display_value: 'repository.keyword',
    showAsFilter: false,
    showAsResult: false,
    filter_types: [],
    key: 'repository',
    value: 'repository.keyword',
    searchTermField: true,
  },

  // Institutionen (mit sauberer ID für klare Filterung)
  {
    display_value: 'repository.keyword',
    showAsFilter: true,
    showAsResult: true,
    filter_types: ['equals'],
    key: 'institution',
    value: 'repositoryId.keyword',
    searchTermField: false,
  },

  // Signature
  {
    display_value: 'signature.keyword',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'signature',
    value: 'signature.keyword',
    searchTermField: true,
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
  // TODO: 'searchSortingNumber' field does not exist yet, but mapping is currently needed because of it beeing used as default sorting field
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

  // Published
  {
    display_value: 'metadata.isPublished',
    filter_types: ['equals', 'notequals'],
    key: 'is_published',
    showAsFilter: true,
    value: 'metadata.isPublished',
  },
];

const entityTypes = ['ARCHIVAL'];

module.exports = {
  mappings,
  entityTypes,
};