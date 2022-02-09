class SortParam {
  constructor(field, direction, nestedPath = null) {
    this.field = field;
    this.direction = direction;
    this.nestedPath = nestedPath;
  }
}

module.exports = SortParam;
