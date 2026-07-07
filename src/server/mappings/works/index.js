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
    showAsResult: false,
    filter_types: ['equals', 'notequals'],
    key: 'attribution',
    value: 'filterInfos.attribution.id',
    nestedPath: 'filterInfos.attribution',
    sortBy: 'filterInfos.attribution.order',
    filterInfos: true,
  },

  // Involvierte Personen (Array)
  {
    display_value: 'involvedPersons',
    filter_types: [],
    key: 'involved_persons',
    value: 'involvedPersons',
    showAsResult: true,
  },

  // Involvierte Personen (Namen-Ebene)
  {
    display_value: 'involvedPersons.name',
    filter_types: [],
    key: 'involved_persons_name',
    value: 'involvedPersons.id',
    nestedPath: 'involvedPersons',
    showAsResult: false,
    searchTermField: true,
  },

  // Standort - Stadt
  {
    display_value: 'locations.term',
    filter_types: [''],
    key: 'locations',
    value: 'locations.term',
    nestedPath: 'locations',
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
    display_value: 'filterInfos.examination_analysis.id.keyword',
    key: 'examination_analysis',
    showAsFilter: true,
    showAsResult: false,
    value: 'filterInfos.examination_analysis.id.keyword',
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
    searchTermField: true,
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
    display_value: 'description',
    showAsFilter: false,
    showAsResult: false,
    sortable: false,
    filter_types: [],
    key: 'description',
    value: 'description',
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
    showAsResult: true,
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

  // References - Reprints
  {
    display_value: 'references.reprints',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'references_reprints',
  },

  // isVirtual (Druckplatte vs. gedrucktes Exemplar)
  {
    display_value: 'isVirtual.keyword',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'is_virtual',
    value: 'isVirtual.keyword',
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

  // Besitzer
  {
    display_value: 'repository.keyword',
    showAsFilter: true,
    showAsResult: true,
    filter_types: ['equals', 'notequals', 'similar'],
    key: 'repository',
    value: 'repository.keyword',
    searchTermField: true,
  },

  // Eigentümer
  {
    display_value: 'owner.keyword',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'owner',
    value: 'owner.keyword',
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

  // Provenance
  {
    display_value: 'provenance',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'provenance',
    value: 'provenance',
    searchTermField: true,
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

  // Search sortingnumber
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

  // Catalog Work Reference
  {
    display_value: 'catalogWorkReferences.description.keyword',
    showAsFilter: true,
    showAsResult: false,
    filter_types: ['equals', 'notequals', 'similar'],
    key: 'catalog_name',
    value: 'catalogWorkReferences.description.keyword',
    nestedPath: 'catalogWorkReferences',
  },

  // Catalog Work Reference Number
  {
    display_value: 'catalogWorkReferences.referenceNumber.keyword',
    showAsFilter: true,
    showAsResult: false,
    filter_types: ['equals', 'notequals', 'similar'],
    key: 'catalog_work_reference_number',
    value: 'catalogWorkReferences.referenceNumber.keyword',
    nestedPath: 'catalogWorkReferences',
  },

  // Additional text information
  {
    display_value: 'additionalTextInformation',
    showAsFilter: false,
    showAsResult: true,
    filter_types: [],
    key: 'additional_text_information_text',
    value: 'additionalTextInformation.text',
    nestedPath: 'additionalTextInformation',
    searchTermField: true,
  },

  // Restoration survey tests text
  {
    display_value: 'restorationSurveys.tests.text',
    showAsFilter: false,
    showAsResult: false,
    filter_types: [],
    key: 'restoration_surveys_tests_text',
    value: 'restorationSurveys.tests.text',
    nestedPath: 'restorationSurveys.tests',
    searchTermField: true,
  },

  // Published
  {
    display_value: 'metadata.isPublished',
    filter_types: ['equals', 'notequals'],
    key: 'is_published',
    showAsFilter: true,
    value: 'metadata.isPublished',
  },

  // LIDO ObjectWorkType - Value
  {
    key: 'objectworktype_value',
    display_value: '',
    showAsResult: true,
    filter_types: [],
    aggregateResult(data) {
      if (data.filterInfos && data.filterInfos.technique && data.filterInfos.technique.length > 0) {
        return data.filterInfos.technique[0].text;
      }
      return undefined;
    },
  },

  // LIDO ObjectWorkType - ID
  {
    key: 'objectworktype_id',
    display_value: '',
    showAsResult: true,
    filter_types: [],
    aggregateResult(data) {
      if (data.filterInfos && data.filterInfos.technique && data.filterInfos.technique.length > 0) {
        return data.filterInfos.technique[0].id;
      }
      return undefined;
    },
  },

  // LIDO displayMaterialsTech
  {
    key: 'display_materials_tech',
    display_value: 'medium.keyword',
    showAsResult: true,
    filter_types: [],
  },

  // LIDO descriptiveNoteValue
  {
    key: 'descriptive_note_value',
    display_value: 'description',
    showAsResult: true,
    filter_types: [],
  },

  // LIDO eventDate referenced printing plate
  {
    key: 'date_referenced',
    display_value: 'dating',
    showAsResult: true,
    filter_types: [],
  },

  // LIDO classification
  {
    key: 'classification',
    display_value: 'classification.classification',
    showAsResult: true,
    filter_types: [],
  },

  // Inventarnummer
  {
    display_value: 'inventoryNumber.keyword',
    showAsResult: true,
    filter_types: [''],
    key: 'inventory_number_referenced',
  },

  // LIDO involved persons referenced printing plate
  {
    display_value: 'involvedPersons',
    showAsResult: true,
    filter_types: [''],
    key: 'involved_persons_referenced',
  },

  // LIDO catalog work references
  {
    display_value: 'catalogWorkReferences',
    showAsResult: true,
    filter_types: [''],
    key: 'catalog_work_references',
  },

  // LIDO catalog work references
  {
    display_value: 'markings',
    showAsResult: true,
    filter_types: [''],
    key: 'markings',
  },

  // LIDO location
  {
    display_value: '',
    showAsResult: true,
    filter_types: [''],
    key: 'location',
    aggregateResult(data) {
      if (data.locations && data.locations.length > 0) {
        return data.locations[0];
      }
      return undefined;
    },
  },

  // LIDO publications
  {
    display_value: 'publications',
    showAsResult: true,
    filter_types: [''],
    key: 'publications',
  },

  // LIDO thumbnail
  {
    display_value: '',
    showAsResult: true,
    filter_types: [''],
    key: 'image_thumbnail',
    aggregateResult(data) {
      if (data.images && data.images.overall && data.images.overall.images
        && data.images.overall.images.length > 0
        && data.images.overall.images[0].sizes
        && data.images.overall.images[0].sizes.xsmall) {
        return data.images.overall.images[0].sizes.xsmall.src;
      }
      return undefined;
    },
  },

  // LIDO Highres image
  {
    display_value: '',
    showAsResult: true,
    filter_types: [''],
    key: 'image_highres',
    aggregateResult(data) {
      if (data.images && data.images.overall && data.images.overall.images
        && data.images.overall.images.length > 0
        && data.images.overall.images[0].sizes
        && data.images.overall.images[0].sizes.origin) {
        return data.images.overall.images[0].sizes.origin.src;
      }
      return undefined;
    },
  },

  // LIDO Highres image
  {
    display_value: 'inscription',
    showAsResult: true,
    filter_types: [''],
    key: 'inscription',
  },

  // LIDO condition
  {
    display_value: 'classification.condition',
    showAsResult: true,
    filter_types: [''],
    key: 'condition',
  },

  // LIDO relatedInContentTo
  {
    display_value: 'references.relatedInContentTo',
    showAsResult: true,
    filter_types: [''],
    key: 'related_in_content_to',
  },

];

// const entityTypes = ['PAINTING', 'GRAPHIC', 'GRAPHIC_REAL', 'DRAWING'];
const entityTypes = ['PAINTING', 'GRAPHIC', 'DRAWING'];

// Fields to copy from referenced object (e.g., printing plate) when isVirtual = false
const referencedFieldsToCopy = [
  'additional_text_information_text',
  'catalog_work_references',
  'descriptive_note_value',
  'inventory_number_referenced',
  'date_referenced',
  'involved_persons_referenced',
  'inscription',
  'objectworktype_id',
  'objectworktype_value',
  'publications',
  'signature',
  'title',

];

module.exports = {
  mappings,
  entityTypes,
  referencedFieldsToCopy,
};
