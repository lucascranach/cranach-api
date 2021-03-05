const mappings = [
  {
    display_value: 'dating.begin',
    key: 'dating_begin',
    filter: true,
    value: 'dating.begin',
    filter_types: ['equals', 'notequals', 'range', 'notrange'],
  },
  {
    display_value: 'dating.end',
    key: 'dating_end',
    filter: true,
    value: 'dating.end',
    filter_types: ['equals', 'notequals', 'range', 'notrange'],
  },
  {
    display_value: 'classification.classification.keyword',
    key: 'classification',
    filter: true,
    value: 'classification.classification.keyword',
    filter_types: ['equals', 'notequals'],
  },
  {
    display_value: 'images.infos.maxDimensions.width',
    key: 'size_width',
    filter: true,
    value: 'images.infos.maxDimensions.width',
    filter_types: ['equals', 'notequals', 'range', 'notrange'],
  },
  {
    display_value: 'images.infos.maxDimensions.height',
    key: 'size_height',
    filter: true,
    value: 'images.infos.maxDimensions.height',
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
