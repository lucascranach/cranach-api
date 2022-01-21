class Querybuilder {
  constructor() {
    this.sortQuerieParams = [];
  }

  sortBy(sortParamObject) {
    this.sortQuerieParams.push({
      [sortParamObject.field]: {
        order: sortParamObject.direction,
      },
    });
  }

  get sortQuerie() {
    return this.sortQuerieParams;
  }
}

module.exports = Querybuilder;
