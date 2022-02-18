class AggregationParam {
  constructor(key, value, displayValue, nestedPath = null) {
    this.key = key;
    this.value = value;
    this.displayValue = displayValue;
    this.nestedPath = nestedPath;
  }
}

module.exports = AggregationParam;
