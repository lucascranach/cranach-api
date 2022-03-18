class FilterParam {
  constructor(key,
    values,
    operator,
    filterTypeGroup,
    valueField,
    nestedPath = null,
    sortBy = null) {
    this.key = key;
    this.values = values;
    this.operator = operator;
    this.filterTypeGroup = filterTypeGroup;
    this.valueField = valueField;
    this.nestedPath = nestedPath;
    this.sortBy = sortBy;
  }
}
module.exports = FilterParam;
